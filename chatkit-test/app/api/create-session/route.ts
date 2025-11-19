import { WORKFLOW_ID } from "@/lib/config";

export async function POST(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    return Response.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "chatkit_beta=v1",
      },
      body: JSON.stringify({
        workflow: { id: WORKFLOW_ID },
        user: crypto.randomUUID(), // Simple random user ID
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Failed to create session" },
        { status: response.status }
      );
    }

    return Response.json({
      client_secret: data.client_secret,
      expires_after: data.expires_after,
    });
  } catch (error) {}
  return Response.json(
    { error: "Failed to create a session" },
    { status: 500 }
  );
}
