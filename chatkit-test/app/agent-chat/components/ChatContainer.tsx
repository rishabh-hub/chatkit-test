"use client";

import { useChat } from "@/lib/chat/hooks";
import { AgenStateIndicator } from "./AgentStateIndicator";
import { AlertCircle, X, icons } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

export const ChatContainer: React.FC = () => {
  const {
    currentMessages,
    agentState,
    isStreaming,
    error,
    sendMessage,
    cancelStream,
    clearError,
  } = useChat();

  return (
    <div className=" flex flex-col h-full bg-background">
      {/* Header with agent state*/}
      <div className=" border-b ">
        <div className=" flex items-center justify-between px-4 py-2">
          <h1 className=" font-semibold">Agent Chat</h1>
          <AgenStateIndicator agentState={agentState} />
        </div>
      </div>

      {error && (
        <div className="">
          <AlertCircle className="h-4 w-4" />
          <span className=" flex-1 text-sm">{error}</span>
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={clearError}
            className=" h-6 2-6"
          >
            <X className=" h-4 w-4" />
          </Button>
        </div>
      )}

      <MessageList messages={currentMessages} />

      <ChatInput
        onSend={sendMessage}
        onCancel={cancelStream}
        isStreaming={isStreaming}
      />
    </div>
  );
};
