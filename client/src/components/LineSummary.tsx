import LineBadge from "./LineBadge";
import { ArrowRight } from "lucide-react";

interface LineSummaryProps {
  lines: string[];
}

export default function LineSummary({ lines }: LineSummaryProps) {
  if (lines.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {lines.map((line, index) => (
        <div key={index} className="flex items-center gap-2">
          <LineBadge lineName={line} />
          {index < lines.length - 1 && (
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
      ))}
    </div>
  );
}
