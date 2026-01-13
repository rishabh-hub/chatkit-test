"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Square } from "lucide-react";
import { FormEvent, KeyboardEvent, useState } from "react";

interface ChatInputProps {
  onSend: (content: string) => void;
  onCancel: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onCancel,
  onSend,
  disabled = false,
  isStreaming = false,
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setInput("");
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift = send
    // Shift+Enter = new line (default behavior)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent newline
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className=" border-t p-4">
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder=" Type a message ... (Enter to send, Shift+Enter for new line"
          disabled={disabled}
          className=" min-h-[60px] max-h-[200px] resize-none"
          rows={1}
        />
        {isStreaming ? (
          <Button
            type="button"
            variant={"destructive"}
            size="icon"
            onClick={onCancel}
            className=" shrink-0"
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            className="shrink-0"
            size="icon"
            disabled={disabled || !input.trim()}
          >
            <Send className=" h-4 w-4" />
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
};
