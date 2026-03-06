import { CheckCircle2, XCircle, FileCode, ShieldAlert, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface Report {
  compilation: {
    status: string;
    timestamp: string;
    duration: string;
  };
  lexical: {
    status: string;
    tokens: number;
  };
  syntax: {
    status: string;
    ast_nodes: number;
  };
  semantic: {
    status: string;
    errors: number;
    warnings: number;
  };
  ir: {
    status: string;
    reason?: string;
  };
  deployment: {
    decision: string;
    reason: string;
  };
}

interface QualityGatePanelProps {
  report: Report;
}

function getDeploymentStyles(decision: string) {
  const lowerDecision = decision.toLowerCase();
  if (lowerDecision === "allowed" || lowerDecision === "success") {
    return {
      bg: "bg-[#1f4620]",
      border: "border-[#4ec9b0]",
      headerText: "text-[#4ec9b0]",
      icon: <CheckCircle2 className="w-5 h-5 text-[#4ec9b0]" />,
    };
  }
  return {
    bg: "bg-[#4a1a1a]",
    border: "border-[#f48771]",
    headerText: "text-[#f48771]",
    icon: <XCircle className="w-5 h-5 text-[#f48771]" />,
  };
}

export function QualityGatePanel({ report }: QualityGatePanelProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "json">("summary");
  // deployment taken directly from report object
  const deployment = {
    decision: report?.deployment?.decision || 'pending',
    reason: report?.deployment?.reason || '',
  };

  const deploymentStyles = getDeploymentStyles(deployment.decision);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="border-b border-[#3e3e42] px-5 py-4 flex items-center justify-between bg-[#252526]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#3794ff] rounded-full"></div>
          <span className="text-sm font-semibold text-white">Quality Gate Results</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
              activeTab === "summary"
                ? "bg-[#3794ff] text-white shadow-md"
                : "text-[#858585] hover:text-white hover:bg-[#3e3e42]"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
              activeTab === "json"
                ? "bg-[#3794ff] text-white shadow-md"
                : "text-[#858585] hover:text-white hover:bg-[#3e3e42]"
            }`}
          >
            JSON
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {activeTab === "summary" ? (
          <>
            {/* Compilation Status */}
            <div className="bg-[#1e1e1e] border border-[#3e3e42] rounded-lg p-4 hover:border-[#505052] transition-all duration-200">
              <div className="flex items-center gap-2.5 mb-3">
                {report.compilation.status === "failed" ? (
                  <XCircle className="w-4 h-4 text-[#f48771] flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#4ec9b0] flex-shrink-0" />
                )}
                <span className="text-sm font-semibold text-white">Compilation</span>
              </div>
              <div className="text-xs text-[#858585] space-y-1.5 ml-6">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span
                    className={
                      report.compilation.status === "failed"
                        ? "text-[#f48771] font-semibold"
                        : "text-[#4ec9b0] font-semibold"
                    }
                  >
                    {report.compilation.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="text-[#cccccc]">{report.compilation.duration}</span>
                </div>
              </div>
            </div>

            {/* Semantic Analysis */}
            <div className="bg-[#1e1e1e] border border-[#3e3e42] rounded-lg p-4 hover:border-[#505052] transition-all duration-200">
              <div className="flex items-center gap-2.5 mb-3">
                <ShieldAlert className="w-4 h-4 text-[#f48771] flex-shrink-0" />
                <span className="text-sm font-semibold text-white">Semantic Analysis</span>
              </div>
              <div className="text-xs text-[#858585] space-y-1.5 ml-6">
                <div className="flex justify-between">
                  <span>Errors:</span>
                  <span className={report.semantic.errors > 0 ? "text-[#f48771] font-semibold" : "text-[#4ec9b0] font-semibold"}>
                    {report.semantic.errors}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Warnings:</span>
                  <span className={report.semantic.warnings > 0 ? "text-[#cca700] font-semibold" : "text-[#858585]"}>
                    {report.semantic.warnings}
                  </span>
                </div>
              </div>
            </div>

            {/* IR Generation */}
            <div className="bg-[#1e1e1e] border border-[#3e3e42] rounded-lg p-4 hover:border-[#505052] transition-all duration-200">
              <div className="flex items-center gap-2.5 mb-3">
                <FileCode className="w-4 h-4 text-[#3794ff] flex-shrink-0" />
                <span className="text-sm font-semibold text-white">IR Generation</span>
              </div>
              <div className="text-xs text-[#858585] ml-6">
                <div className="flex justify-between mb-1.5">
                  <span>Status:</span>
                  <span className="text-[#cccccc] font-semibold">
                    {report.ir.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                {report.ir.reason && (
                  <div className="text-xs text-[#858585] pt-1.5 border-t border-[#3e3e42]">
                    <p className="text-[#666]">{report.ir.reason.replace("_", " ")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Deployment Decision */}
            <div className={`${deploymentStyles.bg} border ${deploymentStyles.border} rounded-lg p-4 transition-all duration-200`}>
              <div className="flex items-center gap-2.5 mb-3">
                {deploymentStyles.icon}
                <span className={`text-sm font-semibold ${deploymentStyles.headerText}`}>
                  Deployment
                </span>
              </div>
              <div className={`text-xs space-y-2 ml-6`}>
                <div className="flex justify-between">
                  <span className={deploymentStyles.headerText}>Decision:</span>
                  <span className={`font-bold text-sm ${deploymentStyles.headerText}`}>{report.deployment.decision.toUpperCase()}</span>
                </div>
                <div className={`${deploymentStyles.headerText} text-xs italic opacity-90`}>
                  {report.deployment.reason}
                </div>
              </div>
            </div>
          </>
        ) : (
          <pre className="text-xs text-[#cccccc] font-mono bg-[#1e1e1e] p-4 rounded-lg overflow-auto border border-[#3e3e42]">
            {JSON.stringify(report, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
