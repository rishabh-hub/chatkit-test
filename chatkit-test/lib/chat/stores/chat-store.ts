import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  AgentState,
  ChatState,
  Message,
  Source,
  ThinkingStep,
  Thread,
  ToolCall,
} from "../types";

interface ChatStore extends ChatState {
  // DATA related (persisted)

  addMessage: (message: Message) => void;
  appendToMessage: (messageId: Message["id"], content: string) => void;
  updateMessage: (messageId: Message["id"], update: Partial<Message>) => void;
  addThinkingStep: (messageId: Message["id"], step: ThinkingStep) => void;
  addToolCall: (messageId: Message["id"], toolCall: ToolCall) => void;
  updateToolCall: (
    messageId: Message["id"],
    toolCallId: ToolCall["id"],
    update: Partial<ToolCall>
  ) => void;
  setMessageSources: (messageId: Message["id"], sources: Source[]) => void;
  setAgentState: (state: AgentState) => void;
  setCurrentToolCall: (toolCall: ToolCall | null) => void;
  setError: (error: string | null) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setStreamingMessageId: (messageId: Message["id"] | null) => void;
  completeStream: () => void;
}

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // INITIAL STATE
        threads: [],
        messages: {},
        currentThreadId: null,
        isStreaming: false,
        streamingMessageId: null,
        agentState: "idle" as AgentState,
        currentToolCall: null,
        error: null,

        // ACTIONS
        createThread: () => {
          const threadId: string = crypto.randomUUID();
          const now = new Date();

          const newThread: Thread = {
            createdAt: now,
            id: threadId,
            title: "New Chat",
            messageCount: 0,
            updatedAt: now,
          };
          set((state) => {
            state.threads.unshift(newThread);
            state.currentThreadId = threadId;
            state.messages[threadId] = [];
          });

          return threadId;
        },

        deleteThread: (threadId: string) => {
          set((state) => {
            state.threads = state.threads.filter(
              (thread) => thread.id !== threadId
            );

            // check if this threadId was the current thread. if yes, then set currentThreadId as some other thread.
            if (state.currentThreadId === threadId) {
              state.currentThreadId = state.threads[0]?.id ?? null;
            }
          });
        },

        selectThread: (threadId: string) => {
          const { isStreaming, cancelStream } = get();
          if (isStreaming) {
            cancelStream();
          }

          set((state) => {
            state.currentThreadId = threadId;
            state.error = null;
          });
        },

        sendMessage: async (content: string) => {
          const state = get();

          // prevent sending messages while streaming
          if (state.isStreaming) return;

          // Create new thread if none exist
          let threadId = state.currentThreadId;
          if (!threadId) {
            threadId = get().createThread();
          }

          const userMessage: Message = {
            id: crypto.randomUUID(),
            threadId,
            role: "user",
            content: content.trim(),
            createdAt: new Date(),
            status: "complete",
          };

          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            threadId,
            role: "assistant",
            content: "",
            createdAt: new Date(),
            status: "streaming",
            thinking: [],
            toolCalls: [],
          };

          set((state) => {
            // Add messages to the store
            state.messages[threadId!].push(userMessage, assistantMessage);

            const thread = state.threads.find((t) => t.id === threadId);

            if (thread) {
              thread.updatedAt = new Date();
              thread.messageCount += 2;

              if (thread.title === "New Chat") {
                const titleContent = content.trim();
                thread.title =
                  titleContent.slice(0, 50) +
                  (titleContent.length > 50 ? "..." : "");
              }

              state.isStreaming = true;
              state.streamingMessageId = assistantMessage.id;
              state.agentState = "thinking";
              state.error = null;
            }
          });

          return;
          // NOTE: Actual API call is handled by useChat hook
          // The hook will read streamingMessageId and make the fetch
        },

        cancelStream: () => {
          set((state) => {
            if (state.streamingMessageId && state.currentThreadId) {
              const messages = state.messages[state.currentThreadId];
              const msg = messages.find(
                (m) => m.id === state.streamingMessageId
              );
              if (msg) {
                msg.status = msg.content ? "complete" : "error";
              }
            }

            //Reset streaming state
            state.isStreaming = false;
            state.streamingMessageId = null;
            state.agentState = "idle";
            state.currentToolCall = null;
          });

          // NOTE: AbortController.abort() is called by useSSE hook
        },

        retryMessage: async (messageId: string) => {
          const { messages, currentThreadId, sendMessage } = get();
          if (!currentThreadId) return;

          const threadMessages = messages[currentThreadId];
          const messageIndex = threadMessages?.findIndex(
            (m) => m.id === messageId
          );

          if (messageIndex === -1 || messageIndex === undefined) return;

          const message = threadMessages[messageIndex];

          // If retrying a user message, remove failed assistant response
          if (message.role === "user") {
            const nextMessage = threadMessages[messageIndex + 1];
            if (
              nextMessage &&
              nextMessage.role === "assistant" &&
              nextMessage.status === "error"
            ) {
              set((state) => {
                state.messages[currentThreadId].splice(messageIndex + 1, 1);

                const thread = state.threads.find(
                  (t) => t.id === currentThreadId
                );
                if (thread) thread.messageCount -= 1;
              });
            }
            await sendMessage(message.content);
          }

          if (message.role === "assistant" && message.status === "error") {
            const prevMessage = threadMessages[messageIndex - 1];
            if (prevMessage.role === "user") {
              set((state) => {
                state.messages[currentThreadId].splice(messageIndex, 1);
                const thread = state.threads.find(
                  (t) => t.id === currentThreadId
                );
                if (thread) thread.messageCount -= 1;
              });
              await sendMessage(prevMessage.content);
            }
          }
        },

        clearError: () => {
          set((state) => {
            state.error = null;
            if (state.agentState === "error") {
              state.agentState = "idle";
            }
          });
        },

        // =====================
        // INTERNAL ACTIONS
        // (Used by SSE hook)
        // =====================

        addMessage: (message: Message) => {
          set((state) => {
            if (!state.messages[message.threadId]) {
              state.messages[message.threadId] = [];
            }
            state.messages[message.threadId].push(message);
          });
        },

        appendToMessage: (messageId: Message["id"], content: string) => {
          const { currentThreadId } = get();
          if (!currentThreadId) {
            return;
          }

          set((state) => {
            const messages = state.messages[currentThreadId];
            const msg = messages.find((m) => m.id === messageId);
            if (msg) {
              msg.content += content;
            }
          });
        },

        updateMessage: (messageId: Message["id"], update: Partial<Message>) => {
          const { currentThreadId } = get();
          if (!currentThreadId) {
            return;
          }

          set((state) => {
            const messages = state.messages[currentThreadId];
            const msg = messages.find((m) => m.id === messageId);
            if (msg) {
              Object.assign(msg, update);
            }
          });
        },

        addThinkingStep: (messageId: Message["id"], step: ThinkingStep) => {
          const { currentThreadId } = get();

          if (!currentThreadId) {
            return;
          }

          set((state) => {
            const messages = state.messages[currentThreadId];
            const msg = messages?.find((m) => m.id === messageId);
            if (msg) {
              if (!msg.thinking) msg.thinking = [];
              msg.thinking.push(step);
            }
          });
        },

        addToolCall: (messageId: string, toolCall: ToolCall) => {
          const { currentThreadId } = get();
          if (!currentThreadId) return;

          set((state) => {
            const messages = state.messages[currentThreadId];
            const msg = messages?.find((m) => m.id === messageId);
            if (msg) {
              if (!msg.toolCalls) msg.toolCalls = [];
              msg.toolCalls.push(toolCall);
            }
          });
        },

        updateToolCall: (
          messageId: string,
          toolCallId: string,
          updates: Partial<ToolCall>
        ) => {
          const { currentThreadId } = get();
          if (!currentThreadId) return;

          set((state) => {
            const messages = state.messages[currentThreadId];
            const msg = messages?.find((m) => m.id === messageId);
            const toolCall = msg?.toolCalls?.find((tc) => tc.id === toolCallId);
            if (toolCall) {
              Object.assign(toolCall, updates);
            }
          });
        },

        setMessageSources: (messageId: string, sources: Source[]) => {
          const { currentThreadId } = get();
          if (!currentThreadId) return;

          set((state) => {
            const messages = state.messages[currentThreadId];
            const msg = messages?.find((m) => m.id === messageId);
            if (msg) {
              if (!msg.metadata) msg.metadata = {};
              msg.metadata.sources = sources;
            }
          });
        },

        setAgentState: (agentState: AgentState) => {
          set((state) => {
            state.agentState = agentState;
          });
        },

        setCurrentToolCall: (toolCall: ToolCall | null) => {
          set((state) => {
            state.currentToolCall = toolCall;
          });
        },

        setError: (error: string | null) => {
          set((state) => {
            state.error = error;
            if (error) {
              state.agentState = "error";
              // Mark streaming message as error
              if (state.streamingMessageId && state.currentThreadId) {
                const messages = state.messages[state.currentThreadId];
                const msg = messages?.find(
                  (m) => m.id === state.streamingMessageId
                );
                if (msg) {
                  msg.status = "error";
                }
              }
            }
          });
        },

        setIsStreaming: (streaming: boolean) => {
          set((state) => {
            state.isStreaming = streaming;
          });
        },

        setStreamingMessageId: (id: string | null) => {
          set((state) => {
            state.streamingMessageId = id;
          });
        },

        completeStream: () => {
          set((state) => {
            // Mark message as complete
            if (state.streamingMessageId && state.currentThreadId) {
              const messages = state.messages[state.currentThreadId];
              const msg = messages?.find(
                (m) => m.id === state.streamingMessageId
              );
              if (msg) {
                msg.status = "complete";
              }
            }

            // Reset streaming state
            state.isStreaming = false;
            state.streamingMessageId = null;
            state.agentState = "idle";
            state.currentToolCall = null;
          });
        },
      })),
      {
        name: "chat-storage",
        version: 1,
        partialize: (state) => ({
          threads: state.threads,
          messages: state.messages,
          currentThreadId: state.currentThreadId,
        }),
      }
    ),
    { name: "ChatStore" }
  )
);
