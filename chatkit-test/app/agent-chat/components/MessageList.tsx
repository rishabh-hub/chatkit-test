import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/lib/chat/types";
import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <ScrollArea className=" flex-1 px-4 ">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Start a conversation ...</p>
        </div>
      )}

      <div className="py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};
