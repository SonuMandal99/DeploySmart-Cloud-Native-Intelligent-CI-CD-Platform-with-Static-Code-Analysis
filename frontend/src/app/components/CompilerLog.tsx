interface LogEntry {
  type: "info" | "success" | "warning" | "error";
  message: string;
}

interface CompilerLogProps {
  logs?: LogEntry[];
}

const emptyStateLogs: LogEntry[] = [
  {
    type: "info",
    message: "[INFO] Click 'Analyze Code' to start compilation...",
  },
];

export function CompilerLog({ logs = emptyStateLogs }: CompilerLogProps) {
  const displayLogs = logs && logs.length > 0 ? logs : emptyStateLogs;

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="border-b border-[#3e3e42] px-4 py-2 bg-[#252526]">
        <span className="text-sm text-[#cccccc]">Compiler Output</span>
      </div>

      {/* Log Content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
        {displayLogs.map((log, index) => (
          <div key={index} className="whitespace-pre-wrap">
            <span
              className={
                log.type === "error"
                  ? "text-[#f48771]"
                  : log.type === "warning"
                  ? "text-[#cca700]"
                  : log.type === "success"
                  ? "text-[#4ec9b0]"
                  : "text-[#858585]"
              }
            >
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
