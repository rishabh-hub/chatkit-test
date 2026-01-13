# Custom Agentic Chatbot - Task Checklist

## Phase 1: Core Infrastructure (COMPLETE)

- [x] 1. Fix typos in lib/chat/types.ts
- [x] 2. Create components/ui/textarea.tsx (shadcn)
- [x] 3. Implement lib/chat/stores/chat-store.ts
- [x] 4. Create lib/chat/sse.ts (SSE parser)
- [x] 5. Create lib/chat/hooks/use-sse.ts
- [x] 6. Create lib/chat/hooks/use-chat.ts
- [x] 7. Create lib/chat/hooks/index.ts (barrel export)
- [x] 8. Create app/api/chat/route.ts (mock SSE endpoint)

## Phase 2: shadcn Components (COMPLETE)

- [x] Install scroll-area
- [x] Install badge
- [x] Install skeleton
- [x] Install tooltip
- [x] Install collapsible

## Phase 3: UI Components (IN PROGRESS)

**Core Chat UI:**
- [ ] 9. Create ChatInput.tsx
- [ ] 10. Create MessageBubble.tsx
- [ ] 11. Create MessageList.tsx
- [ ] 12. Create ChatContainer.tsx
- [ ] 13. Update app/langchain-agent/page.tsx

**Agentic Features:**
- [ ] 14. Create AgentStateIndicator.tsx
- [ ] 15. Create ToolCallCard.tsx
- [ ] 16. Create ThinkingIndicator.tsx
- [ ] 17. Create SourceCard.tsx

**Navigation:**
- [ ] 18. Create ThreadSidebar.tsx

**Component Barrel Export:**
- [ ] 19. Create app/langchain-agent/components/index.ts

## Phase 4: Polish

- [ ] 20. Add markdown rendering (react-markdown)
- [ ] 21. Add auto-scroll behavior
- [ ] 22. Mobile responsive layout
- [ ] 23. Error boundaries
- [ ] 24. Keyboard shortcuts (Enter to send, Esc to cancel)
- [ ] 25. Copy message button
- [ ] 26. Code syntax highlighting

## Phase 5: Backend (Future - Python)

- [ ] Create backend/ directory structure
- [ ] Implement FastAPI main.py with SSE endpoints
- [ ] Create custom agent loop (no framework)
- [ ] Implement @tool decorator and registry
- [ ] Create JSON schema generator for tools
- [ ] Build example tools (web search, calculator)
- [ ] Update Next.js to proxy to Python backend

---

## Current Status

**Frontend Infrastructure:** COMPLETE
- Types, store, SSE parser, hooks all working
- Mock endpoint simulates agent behavior

**Next Step:** Create UI components (items 9-19)

**Backend:** Planning stage
- Will use pure Python + FastAPI
- No LangChain/LlamaIndex/CrewAI
- Custom ReAct agent loop for learning
