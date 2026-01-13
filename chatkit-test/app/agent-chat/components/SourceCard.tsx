import { Source } from "@/lib/chat/types";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Globe, Database, FileText, Code, Server } from "lucide-react";

interface SourceCardProps {
  source: Source;
}

const SOURCE_TYPE_CONFIG = {
  web: { icon: Globe, color: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50" },
  api: { icon: Server, color: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/50" },
  database: { icon: Database, color: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50" },
  document: { icon: FileText, color: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/50" },
  code: { icon: Code, color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" },
} as const;

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  const sourceType = source.metadata?.type || "document";
  const config = SOURCE_TYPE_CONFIG[sourceType] || SOURCE_TYPE_CONFIG.document;
  const Icon = config.icon;

  const truncatedContent =
    source.content.length > 50
      ? source.content.slice(0, 50) + "..."
      : source.content;

  const card = (
    <Badge
      variant="outline"
      className={`cursor-pointer transition-colors ${config.color}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      <span className="font-medium">{source.title}</span>
    </Badge>
  );

  if (source.url) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              {card}
            </a>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs">{truncatedContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">{truncatedContent}</p>
          {source.tool && (
            <p className="text-xs text-muted-foreground mt-1">
              via {source.tool}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
