# Custom Agentic Chatbot - Architecture Plan

This document outlines the frontend architecture for a custom agentic chatbot with tool calling, chain-of-thought visibility, and multi-turn conversations.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                         UI Layer                                    │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐  │ │
│  │  │ ThreadList  │ │ MessageList │ │ ToolCards   │ │ ChatInput    │  │ │
│  │  │ (sidebar)   │ │ (main area) │ │ (inline)    │ │ (bottom)     │  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └──────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                  │                                       │
│                                  ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    State Management (Zustand)                       │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐  │ │
│  │  │ messages[]  │ │ agentState  │ │ toolCalls[] │ │ thinking[]   │  │ │
│  │  │ threads[]   │ │ isStreaming │ │ sources[]   │ │ error        │  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └──────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                  │                                       │
│                                  ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      API/SSE Layer (Hooks)                          │ │
│  │  ┌─────────────────────┐    ┌─────────────────────────────────┐    │ │
│  │  │ useChat()           │    │ useSSE()                        │    │ │
│  │  │ - sendMessage()     │    │ - handleToolCall()              │    │ │
│  │  │ - cancelStream()    │    │ - handleThinking()              │    │ │
│  │  │ - retryMessage()    │    │ - handleContent()               │    │ │
│  │  └─────────────────────┘    └─────────────────────────────────┘    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ SSE Stream (agentic events)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       BACKEND (FastAPI - Future)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│   │    Agent     │────▶│    Tool      │────▶│    LLM       │            │
│   │  Orchestrator│     │   Executor   │     │ (Claude/GPT) │            │
│   └──────────────┘     └──────────────┘     └──────────────┘            │
│          │                    │                                          │
│          ▼                    ▼                                          │
│   ┌──────────────┐     ┌──────────────┐                                 │
│   │   Memory /   │     │   External   │                                 │
│   │   Context    │     │   APIs/DBs   │                                 │
│   └──────────────┘     └──────────────┘                                 │
│                                                                          │
│   Endpoints:                                                             │
│   POST /chat          → StreamingResponse (SSE with agentic events)     │
│   GET  /chat/history  → Message[] with tool calls & sources             │
│   POST /chat/thread   → Create new thread                               │
│   DELETE /chat/thread → Delete thread                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Agentic SSE Event Protocol

The frontend expects these event types from the backend agent:

```typescript
type SSEEventType =
  | "thinking"      // Chain-of-thought reasoning step
  | "tool_call"     // Agent invoking a tool
  | "tool_result"   // Tool execution complete
  | "content"       // Streaming text content
  | "sources"       // Citations/references used
  | "done"          // Stream complete
  | "error";        // Error occurred
```

**Example SSE stream from agentic backend:**

```
data: {"type": "thinking", "data": {"id": "t1", "content": "User wants weather info.", "type": "thought"}}

data: {"type": "tool_call", "data": {"id": "tc1", "name": "get_weather", "arguments": {"city": "NYC"}, "status": "running"}}

data: {"type": "tool_result", "data": {"id": "tc1", "result": {"temp": 72, "condition": "sunny"}, "status": "success"}}

data: {"type": "content", "data": "The current weather in NYC is "}

data: {"type": "content", "data": "72°F and sunny."}

data: {"type": "sources", "data": [{"id": "s1", "title": "Weather API", "tool": "get_weather", "type": "api"}]}

data: [DONE]
```

---

## Agent Loop (Backend - For Reference)

```
┌─────────────────────────────────────────┐
│              AGENT LOOP                  │
├─────────────────────────────────────────┤
│                                          │
│   ┌─────────┐                           │
│   │  INPUT  │ ◄── User message          │
│   └────┬────┘                           │
│        ▼                                │
│   ┌─────────┐     ┌──────────────┐      │
│   │  THINK  │────▶│ Stream       │      │
│   │         │     │ "thinking"   │      │
│   └────┬────┘     │ events       │      │
│        │          └──────────────┘      │
│        ▼                                │
│   ┌─────────┐                           │
│   │ DECIDE  │ Need tool? ──┐            │
│   └────┬────┘              │            │
│        │ No                │ Yes        │
│        │                   ▼            │
│        │          ┌─────────────┐       │
│        │          │ CALL TOOL   │       │
│        │          │ Stream      │       │
│        │          │ "tool_call" │       │
│        │          │ then        │       │
│        │          │ "tool_result│       │
│        │          └──────┬──────┘       │
│        │                 │              │
│        │          ┌──────▼──────┐       │
│        │          │   OBSERVE   │       │
│        │          │ (analyze    │       │
│        │          │  result)    │       │
│        │          └──────┬──────┘       │
│        │                 │              │
│        │◄────────────────┘              │
│        │  (loop back to THINK)          │
│        ▼                                │
│   ┌─────────┐     ┌──────────────┐      │
│   │ RESPOND │────▶│ Stream       │      │
│   │         │     │ "content"    │      │
│   └─────────┘     │ + "sources"  │      │
│                   └──────────────┘      │
│                                          │
└─────────────────────────────────────────┘
```

---

## State Management: Zustand

Based on https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k

| Library    | Best For                               | Why Not For Chat                       |
| ---------- | -------------------------------------- | -------------------------------------- |
| Zustand ✅ | Medium complexity, minimal boilerplate | Perfect fit                            |
| Jotai      | Fine-grained atomic state              | Overkill for linear message history    |
| Redux      | Large enterprise, multiple teams       | Too much boilerplate                   |
| Context    | Simple prop drilling avoidance         | Re-render issues with frequent updates |

**Why Zustand for Agentic Chat:**

- Minimal boilerplate (no providers, no reducers)
- Built-in persistence middleware (for local message caching)
- Easy selectors to prevent unnecessary re-renders
- DevTools support for debugging
- Works great with SSE streaming patterns
- Can track agent state (thinking, calling_tool, streaming) easily

---

## Type System (lib/chat/types.ts)

### Agentic Types

```typescript
/** Individual tool call made by the agent */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  status: "pending" | "running" | "success" | "error";
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

/** Reasoning step for chain-of-thought visibility */
export interface ThinkingStep {
  id: string;
  content: string;
  type: "observation" | "thought" | "action" | "reflection";
  timestamp: string;
}

/** Agent execution state for UI feedback */
export type AgentState = "idle" | "thinking" | "calling_tool" | "streaming" | "error";

/** Source/citation from tool calls */
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
```

### Message with Agentic Capabilities

```typescript
export interface Message {
  id: string;
  threadId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  createdAt: Date;
  status: "pending" | "streaming" | "complete" | "error";

  // Agentic fields
  toolCalls?: ToolCall[];      // Tools invoked by assistant
  toolCallId?: string;         // For tool role responses
  thinking?: ThinkingStep[];   // Visible reasoning steps

  metadata?: {
    model?: string;
    tokens?: number;
    sources?: Source[];
    latency?: number;
    streamed?: boolean;
  };
}
```

### Chat State with Agent Tracking

```typescript
export interface ChatState {
  // Data
  threads: Thread[];
  messages: Record<string, Message[]>; // threadId -> messages
  currentThreadId: string | null;

  // Agent State (new)
  agentState: AgentState;
  currentToolCall: ToolCall | null;

  // Streaming State
  isStreaming: boolean;
  streamingMessageId: string | null;
  error: string | null;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  cancelStream: () => void;
  createThread: () => string;
  deleteThread: (threadId: string) => void;
  selectThread: (threadId: string) => void;
  clearError: () => void;
  retryMessage: (messageId: string) => Promise<void>;
}
```

---

## Implementation Steps

### Phase 1: Core Infrastructure

**Step 1: Install Dependencies**

```bash
npm install zustand immer
npm install eventsource-parser  # For SSE parsing
```

**Step 2: Create Type Definitions**

File: `lib/chat/types.ts`
- Add ToolCall, ThinkingStep, AgentState, Source interfaces
- Update Message interface with agentic fields
- Update ChatState with agent tracking

**Step 3: Create Zustand Store**

File: `lib/chat/store.ts`

```typescript
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        threads: [],
        messages: {},
        currentThreadId: null,
        agentState: "idle",
        currentToolCall: null,
        isStreaming: false,
        streamingMessageId: null,
        error: null,

        // Actions...
      })),
      { name: "chat-storage" }
    )
  )
);
```

---

### Phase 2: SSE Streaming with Agentic Events

**Step 4: Create SSE Parser**

File: `lib/chat/sse.ts`

```typescript
export async function* parseSSEStream(
  response: Response
): AsyncGenerator<SSEEvent, void, unknown> {
  // Parse SSE events and yield typed events
  // Handle: thinking, tool_call, tool_result, content, sources, done, error
}
```

**Step 5: Create useSSE Hook**

File: `lib/chat/hooks/use-sse.ts`

```typescript
export function useSSE() {
  const handleSSEEvent = (event: SSEEvent) => {
    switch (event.type) {
      case "thinking":
        setAgentState("thinking");
        // Add to message.thinking[]
        break;
      case "tool_call":
        setAgentState("calling_tool");
        setCurrentToolCall(event.data);
        break;
      case "tool_result":
        setCurrentToolCall(null);
        setAgentState("thinking");
        break;
      case "content":
        setAgentState("streaming");
        appendToMessage(event.data);
        break;
      case "sources":
        updateMessageMetadata({ sources: event.data });
        break;
      case "done":
        setAgentState("idle");
        completeStream();
        break;
      case "error":
        setAgentState("error");
        setError(event.data);
        break;
    }
  };
}
```

---

### Phase 3: UI Components

**Directory Structure:**

```
app/langchain-agent/
├── page.tsx                  # Main chat page
├── layout.tsx                # Chat layout
└── components/
    ├── ChatContainer.tsx     # Main wrapper
    ├── ThreadSidebar.tsx     # Thread list
    ├── MessageList.tsx       # Scrollable messages
    ├── MessageBubble.tsx     # Individual message
    ├── ToolCallCard.tsx      # Tool execution visualization
    ├── ThinkingIndicator.tsx # Chain-of-thought display
    ├── SourceCard.tsx        # Citation display
    ├── ChatInput.tsx         # Input area
    └── AgentStateIndicator.tsx # Thinking/calling tool status
```

**Step 6: ToolCallCard Component**

Shows tool execution with status, arguments, and results:

```tsx
export function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const statusColors = {
    pending: "border-l-gray-400",
    running: "border-l-blue-500 animate-pulse",
    success: "border-l-green-500",
    error: "border-l-red-500",
  };

  return (
    <Card className={`border-l-4 ${statusColors[toolCall.status]}`}>
      <CardHeader>
        <Wrench className="h-4 w-4" />
        {toolCall.name}
        {toolCall.status === "running" && <Loader2 className="animate-spin" />}
      </CardHeader>
      <CardContent>
        <pre>{JSON.stringify(toolCall.arguments, null, 2)}</pre>
        {toolCall.result && <pre>{JSON.stringify(toolCall.result, null, 2)}</pre>}
      </CardContent>
    </Card>
  );
}
```

**Step 7: ThinkingIndicator Component**

Shows agent's reasoning process:

```tsx
export function ThinkingIndicator({ steps }: { steps: ThinkingStep[] }) {
  return (
    <div className="space-y-2 text-sm text-muted-foreground">
      {steps.map((step) => (
        <div key={step.id} className="flex gap-2">
          {step.type === "thought" && <Brain className="h-4 w-4" />}
          {step.type === "observation" && <Eye className="h-4 w-4" />}
          {step.type === "action" && <Zap className="h-4 w-4" />}
          <span>{step.content}</span>
        </div>
      ))}
    </div>
  );
}
```

**Step 8: AgentStateIndicator Component**

Shows what the agent is currently doing:

```tsx
export function AgentStateIndicator({ state }: { state: AgentState }) {
  const indicators = {
    idle: null,
    thinking: <><Brain className="animate-pulse" /> Thinking...</>,
    calling_tool: <><Wrench className="animate-spin" /> Calling tool...</>,
    streaming: <><Loader2 className="animate-spin" /> Generating...</>,
    error: <><AlertCircle className="text-red-500" /> Error</>,
  };

  return indicators[state] && (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {indicators[state]}
    </div>
  );
}
```

---

### Phase 4: Mock Backend (Until FastAPI is Ready)

**Step 9: Create Mock SSE Endpoint**

File: `app/api/chat/route.ts`

```typescript
export async function POST(request: Request) {
  const { message } = await request.json();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Simulate thinking
      controller.enqueue(encoder.encode(
        `data: ${JSON.stringify({ type: "thinking", data: { id: "t1", content: "Processing request...", type: "thought" } })}\n\n`
      ));
      await sleep(500);

      // Simulate tool call
      controller.enqueue(encoder.encode(
        `data: ${JSON.stringify({ type: "tool_call", data: { id: "tc1", name: "mock_tool", arguments: { query: message }, status: "running" } })}\n\n`
      ));
      await sleep(800);

      // Simulate tool result
      controller.enqueue(encoder.encode(
        `data: ${JSON.stringify({ type: "tool_result", data: { id: "tc1", result: { answer: "Mock result" }, status: "success" } })}\n\n`
      ));
      await sleep(300);

      // Stream content
      const response = `This is a mock agentic response to: "${message}"`;
      for (const word of response.split(" ")) {
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type: "content", data: word + " " })}\n\n`
        ));
        await sleep(50);
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
```

---

### Phase 5: Polish & UX

- [ ] Loading states and skeletons
- [ ] Error boundaries
- [ ] Keyboard shortcuts (Enter to send, Esc to cancel)
- [ ] Mobile responsiveness
- [ ] Thread persistence (Zustand persist middleware)
- [ ] Auto-scroll with user override
- [ ] Markdown rendering in messages
- [ ] Code syntax highlighting
- [ ] Copy message button
- [ ] Retry failed messages

---

## File Structure Summary

```
lib/
└── chat/
    ├── types.ts          # Message, Thread, ToolCall, ThinkingStep, Source, AgentState
    ├── store.ts          # Zustand store with agentic state
    ├── sse.ts            # SSE parsing utilities
    └── hooks/
        ├── use-chat.ts   # Main chat hook
        └── use-sse.ts    # SSE streaming hook

app/
├── api/
│   └── chat/
│       └── route.ts      # Mock → FastAPI proxy
└── langchain-agent/
    ├── page.tsx          # Chat page
    └── components/
        ├── ChatContainer.tsx
        ├── ThreadSidebar.tsx
        ├── MessageList.tsx
        ├── MessageBubble.tsx
        ├── ToolCallCard.tsx
        ├── ThinkingIndicator.tsx
        ├── SourceCard.tsx
        ├── ChatInput.tsx
        └── AgentStateIndicator.tsx
```

---

## What's Different for Agentic vs Simple Chat

| Feature | Simple Chat | Agentic Chat |
|---------|-------------|--------------|
| Message roles | user, assistant, system | + `tool` role |
| Agent state | just isStreaming | idle, thinking, calling_tool, streaming, error |
| Tool tracking | N/A | ToolCall[] with status, args, result |
| Reasoning | Hidden | ThinkingStep[] visible to user |
| Sources | N/A | Source[] with citations |
| SSE events | just content | thinking, tool_call, tool_result, content, sources |
| UI components | MessageBubble, Input | + ToolCallCard, ThinkingIndicator, SourceCard |

---

## Sources

- https://codeawake.com/blog/ai-chatbot-frontend
- https://blog.dagworks.io/p/streaming-chatbot-with-burr-fastapi
- https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k
- https://upstash.com/blog/sse-streaming-llm-responses
- https://medium.com/@fullstacksnack/how-to-work-with-chat-gpt-4-sse-streams-in-react-2efe07811f13
