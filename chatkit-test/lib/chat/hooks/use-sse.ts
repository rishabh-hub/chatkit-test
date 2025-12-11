import { useCallback, useRef } from "react";
import { useChatStore } from "../stores/chat-store";
import {
  SSEEvent,
  ThinkingEventData,
  ToolCallEventData,
  ToolResultEventData,
  parseSSEStream,
} from "../sse";
import { Source, ToolCall } from "../types";

export function useSSE() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    streamingMessageId,
    appendToMessage,
    addThinkingStep,
    addToolCall,
    updateToolCall,
    setMessageSources,
    setAgentState,
    setCurrentToolCall,
    setError,
    completeStream,
  } = useChatStore();

  // startStream function
  const startStream = useCallback(async (threadId: String, content: string) => {
    abortControllerRef.current = new AbortController();

    const messageId = useChatStore.getState().streamingMessageId;
    if (!messageId) {
      console.error("No streaming message ID");
      return;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, content }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} : ${response.statusText}`);
      }

      for await (const event of parseSSEStream(response)) {
        if (abortControllerRef.current.signal.aborted) break;

        handleSSEEvent(event, messageId);
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log("Stream cancelled by User");
      } else {
        console.error("SSE Error", error);
        setError((error as Error).message || "Stream failed");
      }
    }
  }, []);

  // handleSSEEvent function - will be used by startStream

  const handleSSEEvent = useCallback(
    (event: SSEEvent, messageId: string) => {
      switch (event.type) {
        case "thinking": {
          const data = event.data as ThinkingEventData;

          setAgentState("thinking");
          addThinkingStep(messageId, {
            id: data.id,
            content: data.content,
            type: data.type,
            timestamp: new Date().toISOString(),
          });
          break;
        }

        case "tool_call": {
          const data = event.data as ToolCallEventData;
          setAgentState("calling_tool");

          const toolCall = {
            id: data.id,
            name: data.name,
            arguments: data.arguments,
            status: data.status,
            startedAt: new Date().toISOString(),
          } as ToolCall;

          setCurrentToolCall(toolCall);
          addToolCall(messageId, toolCall);
          break;
        }

        case "tool_result": {
          const data = event.data as ToolResultEventData;

          updateToolCall(messageId, data.id, {
            result: data.result,
            status: data.status === "success" ? "complete" : "error",
            error: data.error,
            completedAt: new Date().toISOString(),
          });
          setCurrentToolCall(null);
          setAgentState("thinking");
          break;
        }

        case "content": {
          setAgentState("streaming");
          appendToMessage(messageId, event.data as string);
          break;
        }

        case "sources": {
          const data = event.data as Source[];
          setMessageSources(messageId, data);
          break;
        }

        case "done": {
          return;
        }

        case "error": {
          const data = event.data as string;
          setError(data);
          break;
        }
      }
    },
    [
      setAgentState,
      addThinkingStep,
      addToolCall,
      updateToolCall,
      setCurrentToolCall,
      appendToMessage,
      setMessageSources,
      completeStream,
      setError,
    ]
  );

  // cancelStream function

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    useChatStore.getState().cancelStream();
  }, []);

  return { startStream, cancelStream };
}
