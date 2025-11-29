import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth-server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Card className="w-full sm:w-1/4">
        <CardHeader>
          <CardTitle>Chat App</CardTitle>
          <CardDescription>
            This app builds, implements and tests multiple types of AI based
            agents through chats and other modes and see their outputs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center flex-col gap-2">
            <Button variant="secondary" asChild>
              <Link href="/openai-chatkit">Go to OpenAI Chatkit</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/langchain-agent">Go to Custom Langchain based agent</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
