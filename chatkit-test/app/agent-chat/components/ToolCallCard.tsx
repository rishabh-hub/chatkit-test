"use client";

import { ToolCall } from "@/lib/chat/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ToolCallCardProps {
  toolCall: ToolCall;
}

const statusConfig: Record<
  ToolCall["status"],
  {
    label: string;
    icon: React.ElementType;
    iconColor: string;
    borderColor: string;
    bgColor: string;
    spin?: boolean;
  }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    iconColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-300 dark:border-amber-700",
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
  },
  running: {
    label: "Running",
    icon: Loader2,
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-300 dark:border-blue-700",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    spin: true,
  },
  complete: {
    label: "Complete",
    icon: CheckCircle2,
    iconColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-300 dark:border-green-700",
    bgColor: "bg-green-50 dark:bg-green-950/50",
  },
  error: {
    label: "Failed",
    icon: XCircle,
    iconColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-300 dark:border-red-700",
    bgColor: "bg-red-50 dark:bg-red-950/50",
  },
};

export const ToolCallCard: React.FC<ToolCallCardProps> = ({ toolCall }) => {
  const [isOpen, setIsOpen] = useState(false);

  const config = statusConfig[toolCall.status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "rounded-lg border mb-2 overflow-hidden",
        config.borderColor,
        config.bgColor
      )}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-sm py-2 px-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-2">
            <StatusIcon
              className={cn(
                "w-4 h-4",
                config.iconColor,
                config.spin && "animate-spin"
              )}
            />
            <span className="font-medium">{toolCall.name}</span>
            <span className="text-xs text-muted-foreground">
              ({config.label})
            </span>
          </div>
          <ChevronRight
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              isOpen && "rotate-90"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-1 border-t border-black/10 dark:border-white/10">
            <p className="text-xs text-muted-foreground mb-2">Arguments:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(toolCall.arguments).length > 0 ? (
                Object.entries(toolCall.arguments).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 rounded-md bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 px-2 py-1 text-xs font-mono"
                  >
                    <span className="font-semibold text-primary/70">{key}:</span>
                    <span className="text-muted-foreground truncate max-w-[200px]">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  No arguments
                </span>
              )}
            </div>
            {toolCall.result !== undefined && (
              <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10">
                <p className="text-xs text-muted-foreground mb-1">Result:</p>
                <pre className="text-xs bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded p-2 overflow-x-auto">
                  {JSON.stringify(toolCall.result, null, 2)}
                </pre>
              </div>
            )}
            {toolCall.error && (
              <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10">
                <p className="text-xs text-red-600 dark:text-red-400">{toolCall.error}</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
