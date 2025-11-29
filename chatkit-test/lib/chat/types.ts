export interface ToolCall {
  id: string;
  name: String;
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
  sendMessage: (content: string) => Promise<void>;
  createThread: () => string; //threadId
  cancelStream: () => void;
  selectThread: (threadId: string) => void;
  clearError: () => void;
  deleteThread: (threadId: string) => void;
  retryMessage: (messageId: string) => Promise<void>;
}
