import { MonacoEditor } from "./MonacoEditor";
import { Navigation } from "./Navigation";
import { QualityGatePanel } from "./QualityGatePanel";
import { PipelineVisualization } from "./PipelineVisualization";
import { ErrorList } from "./ErrorList";
import { CompilerLog } from "./CompilerLog";
import { useRef, useState } from "react";
import axios from "axios";
import ASTViewer from "./ASTViewer";
import IRViewer from "./IRViewer";

const defaultCode = `#include <stdio.h>

int main() {
    int x = 10;
    int y = 0;
    
    // Potential division by zero
    int result = x / y;
    
    printf("Result: %d\\n", result);
    return 0;
}`;

const initialMockReport = {
  compilation: {
    status: "skipped",
    timestamp: "-",
    duration: "-",
  },
  lexical: {
    status: "skipped",
    tokens: 0,
  },
  syntax: {
    status: "skipped",
    ast_nodes: 0,
  },
  semantic: {
    status: "skipped",
    errors: 0,
    warnings: 0,
    details: [],
  },
  ir: {
    status: "skipped",
    reason: "Awaiting analysis",
  },
  deployment: {
    decision: "pending",
    reason: "Run analysis to evaluate",
  },
};

interface IError {
  line: number;
  column: number;
  severity: string;
  message: string;
  code: string;
}

interface ILog {
  type: "info" | "success" | "warning" | "error";
  message: string;
}

export function AnalyzerDashboard() {
  const editorRef = useRef<any>(null);

  // Separate state management
  const [code, setCode] = useState(defaultCode);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(initialMockReport);
  const [errors, setErrors] = useState<IError[]>([]);
  const [warnings, setWarnings] = useState<IError[]>([]);
  const [logs, setLogs] = useState<ILog[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ast, setAst] = useState<any | null>(null);
  const [ir, setIr] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("Summary");

  const handleAnalyze = async (codeToAnalyze: string) => {
    // Prevent double-click analysis
    if (loading) return;

    // Clear previous states BEFORE request
    setLoading(true);
    setErrorMessage(null);
    setErrors([]);
    setWarnings([]);
    setLogs([]);

    // Generate initial logs
    const initialLogs: ILog[] = [
      { type: "info", message: "[INFO] Starting compilation process..." },
    ];
    setLogs(initialLogs);

    try {
      const response = await axios.post("http://localhost:5000/api/analyze", { code: codeToAnalyze });
      const data = response.data as any;

      // data is already the full report
      setReport(data);

      // Set AST and IR
      setAst(data.ast || null);
      setIr(data.ir?.instructions || []);

      // populate error/warning lists from semantic.details if present
      const semDetails = Array.isArray(data.semantic?.details) ? data.semantic.details : [];
      const parsedErrors: IError[] = semDetails
        .filter((d: any) => d.type === 'error')
        .map((d: any) => ({ line: d.line || 0, column: 1, severity: 'error', message: d.message || '', code: '' }));
      const parsedWarnings: IError[] = semDetails
        .filter((d: any) => d.type === 'warning')
        .map((d: any) => ({ line: d.line || 0, column: 1, severity: 'warning', message: d.message || '', code: '' }));

      setErrors(parsedErrors);
      setWarnings(parsedWarnings);

      // construct logs based on report stages
      const newLogs: ILog[] = [...initialLogs];
      newLogs.push({ type: data.lexical.status === 'passed' ? 'success' : 'error', message: `[${data.lexical.status.toUpperCase()}] Lexical analysis` });
      newLogs.push({ type: data.syntax.status === 'passed' ? 'success' : 'error', message: `[${data.syntax.status.toUpperCase()}] Syntax analysis` });
      newLogs.push({ type: data.semantic.status === 'passed' ? 'success' : 'error', message: `[${data.semantic.status.toUpperCase()}] Semantic analysis` });
      newLogs.push({ type: data.compilation.status === 'success' ? 'success' : 'error', message: `[${data.compilation.status.toUpperCase()}] Compilation` });
      newLogs.push({ type: data.ir.status === 'generated' ? 'success' : 'warning', message: `[${data.ir.status.toUpperCase()}] IR generation` });
      newLogs.push({ type: data.deployment.decision === 'ALLOWED' ? 'success' : 'error', message: `[${data.deployment.decision}] ${data.deployment.reason}` });
      setLogs(newLogs);
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Analysis failed";
      setErrorMessage(message);
      setReport(initialMockReport);
      setErrors([]);
      setWarnings([]);
      setAst(null);
      setIr([]);
      setLogs([
        {
          type: "error",
          message: `[ERROR] Analysis failed: ${message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setReport(initialMockReport);
    setErrors([]);
    setWarnings([]);
    setLogs([]);
    setErrorMessage(null);
    setAst(null);
    setIr([]);
    // Clear Monaco markers
    if (editorRef.current?.clearMarkers) {
      editorRef.current.clearMarkers();
    }
  };

  const pipelineStages = [
    {
      id: "lexical",
      label: "Lexical",
      status:
        report?.lexical?.status === "passed"
          ? ("passed" as const)
          : report?.lexical?.status === "failed"
          ? ("failed" as const)
          : ("skipped" as const),
    },
    {
      id: "syntax",
      label: "Syntax",
      status:
        report?.syntax?.status === "passed"
          ? ("passed" as const)
          : report?.syntax?.status === "failed"
          ? ("failed" as const)
          : ("skipped" as const),
    },
    {
      id: "semantic",
      label: "Semantic",
      status:
        report?.semantic.errors > 0
          ? ("failed" as const)
          : report?.semantic.status !== "skipped"
          ? ("passed" as const)
          : ("skipped" as const),
    },
    {
      id: "ir",
      label: "IR",
      status:
        report?.ir.status === "generated"
          ? ("passed" as const)
          : ("skipped" as const),
    },
    {
      id: "decision",
      label: "Decision",
      status: (() => {
        const dec = report?.deployment.decision?.toLowerCase();
        if (dec === "allowed") return "passed" as const;
        if (dec === "blocked") return "failed" as const;
        return "skipped" as const;
      })(),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Navigation />

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-[#3a1f1f] border-b border-[#b33333] px-6 py-3 text-sm text-[#f48771]">
          {errorMessage}
        </div>
      )}

      {/* Pipeline Visualization - Compact */}
      <div className="border-b border-[#3e3e42] bg-[#252526] px-6 py-3 flex-shrink-0">
        <PipelineVisualization stages={pipelineStages} />
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 flex flex-col overflow-auto">
        
        {/* Top Section: Editor + Quality Gate */}
        <div className="flex gap-6 p-6 bg-[#1e1e1e] min-h-fit">
          
          {/* Left: Code Editor (65%) */}
          <div className="flex-[2] flex flex-col bg-[#252526] rounded-lg border border-[#3e3e42] overflow-hidden shadow-sm hover:border-[#505052] transition-colors duration-200">
            <MonacoEditor
              ref={editorRef}
              defaultLanguage="c"
              defaultValue={code}
              value={code}
              fileName="main.c"
              loading={loading}
              onAnalyze={handleAnalyze}
              onClear={handleClear}
              errors={errors}
              warnings={warnings}
            />
          </div>

          {/* Right: Quality Gate (35%) */}
          <div className="flex-1 flex flex-col bg-[#252526] rounded-lg border border-[#3e3e42] overflow-hidden shadow-sm hover:border-[#505052] transition-colors duration-200">
            <QualityGatePanel report={report} />
          </div>
        </div>

        {/* Bottom Section: Problems + Compiler Output */}
        <div className="flex gap-6 px-6 pb-6 bg-[#1e1e1e]">
          
          {/* Problems Panel (50%) */}
          <div className="flex-1 bg-[#252526] rounded-lg border border-[#3e3e42] overflow-auto shadow-sm hover:border-[#505052] transition-colors duration-200 max-h-64">
            <ErrorList errors={[...errors, ...warnings]} />
          </div>

          {/* Compiler Output Panel (50%) with Tabs */}
          <div className="flex-1 bg-[#252526] rounded-lg border border-[#3e3e42] overflow-hidden shadow-sm hover:border-[#505052] transition-colors duration-200 max-h-64">
            <div className="flex flex-col h-full">
              <div className="flex-shrink-0 bg-[#1f2328] px-3 py-2 flex items-center gap-3 border-b border-[#37373a]">
                {['Summary','JSON','AST','IR'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded text-sm ${activeTab===tab? 'bg-[#2b6b9a] text-white' : 'text-slate-300 hover:bg-[#2b2b2b]'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-auto">
                {activeTab === 'Summary' && (
                  <div className="p-3"><CompilerLog logs={logs} /></div>
                )}
                {activeTab === 'JSON' && (
                  <pre className="p-3 text-xs text-slate-200 font-mono overflow-auto">{JSON.stringify({ report, ast, ir }, null, 2)}</pre>
                )}
                {activeTab === 'AST' && (
                  <div className="h-full"><ASTViewer ast={ast} /></div>
                )}
                {activeTab === 'IR' && (
                  <div className="h-full"><IRViewer ir={ir} /></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
