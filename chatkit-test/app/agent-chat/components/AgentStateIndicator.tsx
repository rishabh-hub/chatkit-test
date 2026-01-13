"use client";

import { AgentState } from "@/lib/chat/types";
import { Loader2, Circle, AlertCircle, Terminal, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentIndicatorProps {
  agentState: AgentState;
}

interface StateUIConfig {
  icon: React.ReactNode;
  textColor: string;
  bgColor: string;
  animationClass: string;
  label: string;
}

const STATE_CONFIG: Record<AgentState, StateUIConfig> = {
  idle: {
    icon: <Circle size={14} />,
    textColor: "text-slate-500",
    bgColor: "bg-slate-100",
    animationClass: "",
    label: "Ready",
  },
  thinking: {
    icon: <Loader2 size={14} className="animate-spin" />,
    textColor: "text-blue-600",
    bgColor: "bg-blue-50",
    animationClass: "animate-pulse",
    label: "Thinking...",
  },
  calling_tool: {
    icon: <Terminal size={14} />,
    textColor: "text-orange-600",
    bgColor: "bg-orange-50",
    animationClass: "animate-bounce",
    label: "Calling tool...",
  },
  streaming: {
    icon: <Activity size={14} />,
    textColor: "text-green-600",
    bgColor: "bg-green-50",
    animationClass: "animate-pulse",
    label: "Generating...",
  },
  error: {
    icon: <AlertCircle size={14} />,
    textColor: "text-red-600",
    bgColor: "bg-red-50",
    animationClass: "animate-shake",
    label: "Error",
  },
};

export const AgentStateIndicator: React.FC<AgentIndicatorProps> = ({
  agentState,
}) => {
  const config = STATE_CONFIG[agentState];

  if (agentState === "idle") {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
        config.bgColor,
        config.textColor,
        config.animationClass
      )}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

// Also export with the old name for backwards compatibility
export { AgentStateIndicator as AgenStateIndicator };
