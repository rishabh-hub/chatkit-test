export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  status: "pending" | "running" | "complete" | "error";
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ThinkingStep {
  id: string;
  content: string;
  type: "observation" | "thought" | "action" | "reflection";
  timestamp: string;
}

export type AgentState =
  | "idle"
  | "thinking"
  | "calling_tool"
  | "streaming"
  | "error";

export interface Source {
  id: string;
  title: string;
  content: string;
  url?: string;
  tool?: string;
  fetchedAt?: string;
  metadata?: {
    page?: number;
    section?: string;
    type?: "web" | "api" | "database" | "document" | "code";
  };
}

export interface Message {
  id: string;
  threadId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  createdAt: Date;
  status: "pending" | "streaming" | "complete" | "error";
  toolCalls?: ToolCall[];
  toolCallId?: string;
  thinking?: ThinkingStep[];
  metadata?: {
    model?: string;
    tokens?: number;
    sources?: Source[];
    latency?: number;
    streamed?: boolean;
    [key: string]: any;
  };
}

export interface Thread {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

export interface ChatState {
  //Data
  threads: Thread[];
  messages: Record<string, Message[]>; //threadId -> messages[]
  currentThreadId: string | null;

  //UI
  isStreaming: boolean;
  streamingMessageId: string | null;
  error: string | null;

  agentState: AgentState;
  currentToolCall: ToolCall | null;

  //Actions
  createThread: () => string; //threadId
  deleteThread: (threadId: string) => void;
  selectThread: (threadId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  cancelStream: () => void;
  retryMessage: (messageId: string) => Promise<void>;
  clearError: () => void;
}
