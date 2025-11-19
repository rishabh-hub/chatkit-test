"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useRouter } from "next/navigation";
// import { useTheme } from "next-themes";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Card className=" w-1/4">
        <CardHeader>
          <CardTitle> Chat App</CardTitle>
          <CardDescription>
            This app builds, implements and tests multiple types of AI based
            agents through chats and other modes and see their outputs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className=" flex items-center flex-col gap-2">
            <Button
              className=" cursor-pointer"
              onClick={() => router.push("/openai-chatkit")}
            >
              Go to OpenAI Chatkit
            </Button>
            <Button
              className=" cursor-pointer"
              onClick={() => router.push("/about")}
            >
              Go to Custom Langchain based agent
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
