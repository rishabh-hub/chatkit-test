"use client";
import { MyChat } from "@/components/Chat";
import { useTheme } from "next-themes";

export default function Chat() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-full flex flex-col gap-2 items-center justify-center">
      <div className=" text-2xl font-semibold">OpenAI Chatkit SDK</div>
      <MyChat theme={theme} setTheme={setTheme} />
    </div>
  );
}
