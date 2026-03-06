import { AlertCircle, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";

interface Error {
  line: number;
  column: number;
  severity: string;
  message: string;
  code: string;
}

interface ErrorListProps {
  errors: Error[];
}

export function ErrorList({ errors = [] }: ErrorListProps) {
  const [open, setOpen] = useState(true);

  // Memoize computed values
  const { errorCount, warningCount, sortedErrors } = useMemo(() => {
    if (!Array.isArray(errors)) {
      return { errorCount: 0, warningCount: 0, sortedErrors: [] };
    }

    const errCount = errors.filter(
      (e) => e.severity === "error"
    ).length;
    const warnCount = errors.filter(
      (e) => e.severity === "warning"
    ).length;

    const sorted = [...errors].sort((a, b) => a.line - b.line);

    return {
      errorCount: errCount,
      warningCount: warnCount,
      sortedErrors: sorted,
    };
  }, [errors]);

  return (
    <div className="h-full flex flex-col bg-[#252526]">
      {/* Header */}
      <div className="border-b border-[#3e3e42] px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className="text-sm text-[#cccccc] flex items-center gap-2 hover:text-white transition-colors"
        >
          <span>Problems</span>
          <span className="text-xs text-[#858585]">
            {open ? "▼" : "▶"}
          </span>
        </button>
        <span className="text-xs text-[#858585]">
          {errorCount} {errorCount === 1 ? "error" : "errors"},
          {" "}
          {warningCount} {warningCount === 1 ? "warning" : "warnings"}
        </span>
      </div>

      {/* Empty State */}
      {sortedErrors.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-[#858585] text-sm">
          <p>No issues detected</p>
        </div>
      )}

      {/* Error List */}
      {open && sortedErrors.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          {sortedErrors.map((error, index) => (
            <div
              key={index}
              className="px-4 py-2 border-b border-[#3e3e42] hover:bg-[#2a2d2e] cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-2">
                {error.severity === "error" ? (
                  <AlertCircle className="w-4 h-4 text-[#f48771] mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#cca700] mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#cccccc]">{error.message}</div>
                  <div className="text-xs text-[#858585] mt-1">
                    [Ln {error.line}, Col {error.column}] {error.code}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
