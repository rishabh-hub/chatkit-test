import { ThinkingStep, ToolCall } from "./types";

export type SSEEventType =
  | "thinking"
  | "tool_call"
  | "tool_result"
  | "content"
  | "sources"
  | "done"
  | "error";

export interface SSEEvent {
  type: SSEEventType;
  data: unknown;
}

export interface ThinkingEventData {
  id: string;
  content: string;
  type: ThinkingStep["type"];
}

export interface ToolCallEventData {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  status: ToolCall["status"];
}

export interface ToolResultEventData {
  id: string;
  result?: unknown;
  error?: string;
  status: "success" | "error";
}

export async function* parseSSEStream(
  response: Response
): AsyncGenerator<SSEEvent, void, unknown> {
  if (!response.body) {
    throw new Error("No response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      // Keep incomplete line in buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;

        const data = line.slice(6).trim();

        if (data === "[DONE]") {
          // Specific to OpenAI
          yield { type: "done", data: null };
          continue;
        }

        try {
          const parsed = JSON.parse(data);
          yield parsed as SSEEvent;
        } catch (err) {
          yield { type: "content", data };
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
