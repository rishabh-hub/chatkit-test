import { Button } from "@/components/ui/button";
import { Collapsible } from "@/components/ui/collapsible";
import { ThinkingStep } from "@/lib/chat/types";
import {
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import {
  Brain,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  Ghost,
  Lightbulb,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface ThinkingIndicatorProps {
  steps: ThinkingStep[];
}
// Indicator needs to
export function ThinkingIndicator({ steps }: ThinkingIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const stepIcons: Record<ThinkingStep["type"], React.ReactNode> = {
    thought: <Brain className="h-3 w-3 text-purple-500" />,
    observation: <Eye className="h-3 w-3 text-blue-500" />,
    action: <Zap className="h-3 w-3 text-yellow-500" />,
    reflection: <Lightbulb className="h-3 w-3 text-green-500" />,
  };

  if (steps.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-2">
      <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <Brain className="h-3 w-3" />
        <span>Thinking process ({steps.length} steps)</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 space-y-1 pl-4 border-l-2 border-muted">
        {steps.map((step) => {
          return (
            <div
              key={step.id}
              className="flex items-start gap-2 text-xs text-muted-foreground"
            >
              <span className="mt-0.5">{stepIcons[step.type]}</span>
              <span>{step.content}</span>
            </div>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
