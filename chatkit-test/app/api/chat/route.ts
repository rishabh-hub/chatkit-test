import { NextRequest } from "next/server";

interface ChatRequestBody {
  threadId: string;
  content: string;
}
// Helper for delays
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: NextRequest) {
  const { threadId, content } = (await request.json()) as ChatRequestBody;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: { type: string; data: unknown }) => {
        controller.enqueue(
          encoder.encode(`data : ${JSON.stringify(event)}\n\n`)
        );
      };

      try {
        // 1. Thinking
        send({
          type: "thinking",
          data: {
            id: crypto.randomUUID(),
            content: "Let me think about that...",
            type: "thought",
          },
        });

        await sleep(600);

        // 2. Tool call
        const toolCallId = crypto.randomUUID();
        send({
          type: "tool_call",
          data: {
            id: toolCallId,
            name: "search_knowledge",
            arguments: { query: content },
            status: "running",
          },
        });

        await sleep(800);

        // 3. Tool result
        send({
          type: "tool_result",
          data: {
            id: toolCallId,
            result: { found: true, relevance: 0.92 },
            status: "success",
          },
        });

        await sleep(400);

        // 4. More thinking
        send({
          type: "thinking",
          data: {
            id: crypto.randomUUID(),
            content: "Found relevant information, formulating response ...",
            type: "observation",
          },
        });

        await sleep(300);

        // 5. Stream content word by word
        const response = `This is a mock agentic response to your message: "${content}". The agent searched its knowledge base and found relevant information. In a 
        real implementation, this would connect to your FastAPI backend.`;

        for (const word of response.split(" ")) {
          send({ type: "content", data: word + " " });
          await sleep(40);
        }

        // 6. Sources
        send({
          type: "sources",
          data: [
            {
              id: crypto.randomUUID(),
              title: "Knowledge Base",
              content: "Relevant excerpt...",
              tool: "search_knowledge",
              metadata: { type: "database" },
            },
          ],
        });

        // 7. Done
        controller.enqueue(encoder.encode("data : [DONE]\n\n"));
      } catch (error) {
        send({ type: "error", data: String(error) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "cache-control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
