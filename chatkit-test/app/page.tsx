"use client";
import { MyChat } from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function Home() {
  const { setTheme, theme } = useTheme();
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {/* <Button>GGWP SHADCN BUTTON</Button> */}

      <MyChat />
    </div>
  );
}
