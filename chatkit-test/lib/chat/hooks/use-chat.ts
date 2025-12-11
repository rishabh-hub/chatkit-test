import { use, useCallback } from "react";
import { useChatStore } from "../stores/chat-store";
import { useSSE } from "./use-sse";

export function useChat() {
  const { startStream, cancelStream } = useSSE();

  const {
    threads,
    messages,
    currentThreadId,
    isStreaming,
    agentState,
    currentToolCall,
    error,
    createThread,
    deleteThread,
    selectThread,
    sendMessage: prepareSendMessage,
    clearError,
    retryMessage: storeRetryMessage,
  } = useChatStore();

  const currentMessages = currentThreadId
    ? messages[currentThreadId] ?? []
    : [];

  const currentThread = threads.find((t) => t.id === currentThreadId);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      //Prepare message for sending.

      await prepareSendMessage(content);

      const threadId = useChatStore.getState().currentThreadId;
      if (!threadId) return;

      await startStream(threadId, content);
    },
    [isStreaming, prepareSendMessage, startStream]
  );

  const retryMessage = useCallback(
    async (messageId: string) => {
      await storeRetryMessage(messageId);

      const threadId = useChatStore.getState().currentThreadId;
      const streamingId = useChatStore.getState().streamingMessageId;

      if (threadId && streamingId) {
        // Find the user message content to retry

        const msgs = useChatStore.getState().messages[threadId];
        const userMsgIndex = msgs.findIndex((m) => m.id === messageId);

        if (userMsgIndex !== -1) {
          const userMsg = msgs[userMsgIndex];
          if (userMsg.role === "user") {
            await startStream(threadId, userMsg.content);
          }
        }
      }
    },
    [storeRetryMessage, startStream]
  );

  return {
    //Data
    threads,
    currentThread,
    currentMessages,
    currentThreadId,

    //State
    agentState,
    isStreaming,
    currentToolCall,
    error,

    //Actions
    sendMessage,
    cancelStream,
    createThread,
    deleteThread,
    selectThread,
    clearError,
    retryMessage,
  };
}
