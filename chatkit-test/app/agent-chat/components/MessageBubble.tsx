import { Message, Source, ToolCall } from "@/lib/chat/types";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { ToolCallCard } from "./ToolCallCard";
import { SourceCard } from "./SourceCard";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div className={cn("flex gap-3 px-4 py-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={cn("flex flex-col max-w-[80%]", isUser && "items-end")}>
        {isAssistant && message.thinking && message.thinking.length > 0 && (
          <ThinkingIndicator steps={message.thinking} />
        )}

        {isAssistant && message.toolCalls && message.toolCalls.length > 0 && (
          <div>
            {message.toolCalls.map((toolCall: ToolCall) => (
              <ToolCallCard key={toolCall.id} toolCall={toolCall} />
            ))}
          </div>
        )}

        {message.content && (
          <div
            className={cn(
              "rounded-2xl px-4 py-2",
              isUser
                ? "bg-blue-500 text-white rounded-br-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md",
              message.status === "streaming" && "animate-pulse"
            )}
          >
            <p className=" text-sm whitespace-pre-wrap"> {message.content}</p>
          </div>
        )}

        {isAssistant &&
          message.metadata?.sources &&
          message.metadata.sources.length > 0 && (
            <div className=" flex flex-wrap gap-2 mt-2">
              {message.metadata?.sources.map((source: Source) => (
                <SourceCard key={source.id} source={source} />
              ))}
            </div>
          )}

        {message.status === "error" && (
          <p className=" text-xs text-red-500 mt-1"> Failed to send</p>
        )}
      </div>
    </div>
  );
};
