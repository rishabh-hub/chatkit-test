# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start development server (Next.js 16)
npm run build    # Production build
npm run lint     # Run ESLint
npm start        # Start production server
```

## Environment Variables

Required in `.env.local`:
- `OPENAI_API_KEY` - OpenAI API key for ChatKit sessions
- `NEXT_PUBLIC_CHATKIT_WORKFLOW_ID` - ChatKit workflow ID
- `JWT_SECRET` - Secret for JWT authentication (defaults to fallback in dev)

## Architecture

### AI Chat Integration

This app tests multiple AI agent implementations:

1. **OpenAI ChatKit** (`/openai-chatkit`)
   - Uses `@openai/chatkit-react` SDK
   - Session creation via `/api/create-session` → OpenAI ChatKit API
   - Config in `lib/config.ts` (workflow ID, starter prompts)

2. **Custom Agentic Chat** (`/langchain-agent`)
   - Custom frontend with Zustand state management
   - SSE streaming for real-time agent responses
   - Backend: Python + FastAPI (no framework, custom agent loop)
   - See PLAN.md for full architecture

### Custom Chat System Architecture

```
lib/chat/
├── types.ts              # ToolCall, ThinkingStep, AgentState, Source, Message, Thread
├── sse.ts                # SSE event parser (async generator)
├── stores/
│   └── chat-store.ts     # Zustand store with immer + persist + devtools
└── hooks/
    ├── index.ts          # Barrel export
    ├── use-chat.ts       # Main hook combining store + SSE
    └── use-sse.ts        # SSE connection and event handling

app/
├── api/chat/route.ts     # Mock SSE endpoint (simulates agent behavior)
└── langchain-agent/
    ├── page.tsx          # Chat page
    └── components/       # UI components (in progress)
```

**Key Types:**
- `AgentState`: "idle" | "thinking" | "calling_tool" | "streaming" | "error"
- `ToolCall`: Tool invocations with status, args, result
- `ThinkingStep`: Chain-of-thought visibility (observation, thought, action, reflection)
- `Source`: Citations from tool calls

**SSE Event Protocol:**
```
thinking → tool_call → tool_result → content (streaming) → sources → done
```

**State Management:**
- Zustand with immer for immutable updates
- Persist middleware for local storage (threads, messages)
- DevTools middleware for debugging

### Authentication Flow

JWT-based auth with cookie sessions (7 day expiry):

- **Server-side** (`lib/auth-server.ts`): JWT creation/verification, cookie management using `jose` + `next/headers`
- **Client-side** (`lib/auth-client.ts`): Login/logout/getCurrentUser via fetch to API routes
- **Middleware** (`proxy.ts`): Route protection, redirects unauthenticated users to `/login`
- **In-memory DB** (`lib/db.ts`): Test user storage using Map (test@gmail.com / password)

### API Routes

- `/api/auth/login` - Login endpoint
- `/api/auth/logout` - Logout endpoint
- `/api/auth/me` - Get current user
- `/api/create-session` - Create OpenAI ChatKit session

### UI Stack

- Next.js 16 App Router with React 19
- Tailwind CSS 4 + tw-animate-css
- Radix UI primitives (dialog, dropdown, navigation, avatar)
- next-themes for dark/light mode
- Framer Motion for animations
- Components use shadcn/ui patterns (`components/ui/`)
