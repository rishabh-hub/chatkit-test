import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { Dispatch, SetStateAction } from "react";

export function MyChat({
  theme,
  setTheme,
}: {
  theme: string | undefined;
  setTheme: Dispatch<SetStateAction<string>>;
}) {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch("/api/create-session", {
          method: "POST",
        });

        const { client_secret } = await res.json();

        return client_secret;
      },
    },
    theme: theme as "dark" | "light",
  });

  return <ChatKit control={control} className="h-[700px] w-[420px]" />;
}
