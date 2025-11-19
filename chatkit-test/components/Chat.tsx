import { ChatKit, useChatKit } from "@openai/chatkit-react";

export function MyChat() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(s) {
        const res = await fetch("/api/create-session", {
          method: "POST",
        });

        const { client_secret } = await res.json();

        return client_secret;
      },
    },
  });

  return <ChatKit control={control} className="h-[700px] w-[420px]" />;
}
