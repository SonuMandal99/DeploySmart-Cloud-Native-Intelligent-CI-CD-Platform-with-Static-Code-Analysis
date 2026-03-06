import { CheckCircle2, XCircle, Circle } from "lucide-react";

interface PipelineStage {
  id: string;
  label: string;
  status: "passed" | "failed" | "skipped";
}

interface PipelineVisualizationProps {
  stages?: PipelineStage[];
}

const defaultStages: PipelineStage[] = [
  { id: "lexical", label: "Lexical", status: "passed" },
  { id: "syntax", label: "Syntax", status: "passed" },
  { id: "semantic", label: "Semantic", status: "failed" },
  { id: "ir", label: "IR", status: "skipped" },
  { id: "decision", label: "Decision", status: "skipped" },
];

function getStageStyles(status: "passed" | "failed" | "skipped") {
  switch (status) {
    case "passed":
      return {
        bg: "bg-[#1f4620]",
        border: "border-[#4ec9b0]",
        text: "text-[#4ec9b0]",
        icon: "text-[#4ec9b0]",
      };
    case "failed":
      return {
        bg: "bg-[#4a1a1a]",
        border: "border-[#f48771]",
        text: "text-[#f48771]",
        icon: "text-[#f48771]",
      };
    case "skipped":
      return {
        bg: "bg-[#2d2d2d]",
        border: "border-[#858585]",
        text: "text-[#858585]",
        icon: "text-[#858585]",
      };
  }
}

export function PipelineVisualization({
  stages = defaultStages,
}: PipelineVisualizationProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      {stages.map((stage, index) => {
        const styles = getStageStyles(stage.status);

        return (
          <div key={stage.id} className="flex items-center gap-3">
            {/* Stage Box */}
            <div
              className={`flex items-center gap-2 px-4 py-2.5 rounded border ${styles.bg} ${styles.border}`}
            >
              {stage.status === "passed" && (
                <CheckCircle2 size={18} className={styles.icon} />
              )}
              {stage.status === "failed" && (
                <XCircle size={18} className={styles.icon} />
              )}
              {stage.status === "skipped" && (
                <Circle size={18} className={styles.icon} strokeWidth={1.5} />
              )}
              <span className={`text-sm font-medium ${styles.text}`}>
                {stage.label}
              </span>
            </div>

            {/* Arrow between stages */}
            {index < stages.length - 1 && (
              <div className="flex items-center">
                <div className="w-6 h-0.5 bg-linear-to-r from-[#858585] to-[#3e3e42]"></div>
                <div className="w-0 h-0 border-l-2 border-t-2 border-b-2 border-l-[#858585] border-t-[#3e3e42] border-b-[#3e3e42]" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
