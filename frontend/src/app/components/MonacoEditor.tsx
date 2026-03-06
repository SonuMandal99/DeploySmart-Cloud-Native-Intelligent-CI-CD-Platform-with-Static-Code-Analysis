import Editor, { Monaco } from "@monaco-editor/react";
import { Play, Trash2 } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";

interface IError {
  line: number;
  column: number;
  severity: string;
  message: string;
  code: string;
}

interface MonacoEditorProps {
  defaultLanguage?: string;
  defaultValue?: string;
  value?: string;
  onAnalyze: (code: string) => void;
  onClear: () => void;
  loading?: boolean;
  fileName?: string;
  errors?: IError[];
  warnings?: IError[];
}

export const MonacoEditor = forwardRef<any, MonacoEditorProps>(
  (
    {
      defaultLanguage = "c",
      defaultValue = "",
      value,
      onAnalyze,
      onClear,
      loading = false,
      fileName = "code.c",
      errors = [],
      warnings = [],
    },
    ref
  ) => {
    const [code, setCode] = useState(defaultValue);
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<Monaco | null>(null);

    // Handle external value changes
    useEffect(() => {
      if (value !== undefined && value !== code) {
        setCode(value);
      }
    }, [value]);

    // Handle marker updates when errors or warnings change
    useEffect(() => {
      if (!editorRef.current || !monacoRef.current) return;

      const model = editorRef.current.getModel();
      if (!model) return;

      // Clear old markers before setting new ones to prevent duplication
      monacoRef.current.editor.setModelMarkers(model, "owner", []);

      // Map errors and warnings to Monaco markers
      const markers: any[] = [];

      errors.forEach((error) => {
        markers.push({
          startLineNumber: Math.max(1, error.line),
          startColumn: Math.max(1, error.column),
          endLineNumber: Math.max(1, error.line),
          endColumn: error.column + 10,
          message: error.message,
          severity: monacoRef.current!.MarkerSeverity.Error,
          code: error.code,
        });
      });

      warnings.forEach((warning) => {
        markers.push({
          startLineNumber: Math.max(1, warning.line),
          startColumn: Math.max(1, warning.column),
          endLineNumber: Math.max(1, warning.line),
          endColumn: warning.column + 10,
          message: warning.message,
          severity: monacoRef.current!.MarkerSeverity.Warning,
          code: warning.code,
        });
      });

      // Set new markers safely
      monacoRef.current.editor.setModelMarkers(model, "owner", markers);
    }, [errors, warnings]);

    // Expose clearMarkers function via ref
    useEffect(() => {
      if (typeof ref === "function") {
        ref({
          clearMarkers: () => {
            if (editorRef.current && monacoRef.current) {
              const model = editorRef.current.getModel();
              if (model) {
                monacoRef.current.editor.setModelMarkers(model, "owner", []);
              }
            }
          },
        });
      } else if (ref) {
        ref.current = {
          clearMarkers: () => {
            if (editorRef.current && monacoRef.current) {
              const model = editorRef.current.getModel();
              if (model) {
                monacoRef.current.editor.setModelMarkers(model, "owner", []);
              }
            }
          },
        };
      }
    }, [ref]);

    const handleEditorMount = (editor: any, monaco: Monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
    };

    const handleAnalyze = () => {
      if (!loading) {
        onAnalyze(code);
      }
    };

    const handleClear = () => {
      setCode("");
      onClear();
      // Clear markers
      if (editorRef.current && monacoRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          monacoRef.current.editor.setModelMarkers(model, "owner", []);
        }
      }
    };

    return (
      <div className="flex-1 h-full flex flex-col bg-[#1e1e1e]">
        {/* File Tab */}
        <div className="bg-[#252526] px-4 py-3 flex items-center justify-between border-b border-[#3e3e42]">
          <span className="text-sm font-medium text-[#cccccc]">{fileName}</span>
          <span className="text-xs text-[#858585]">Language: {defaultLanguage}</span>
        </div>

        {/* Editor Container */}
        <div className="flex-1 h-full overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage={defaultLanguage}
            value={code}
            onChange={(value) => setCode(value || "")}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              renderWhitespace: "selection",
              glyphMargin: true,
            }}
          />
        </div>

        {/* Button Container */}
        <div className="bg-[#1e1e1e] border-t border-[#3e3e42] px-4 py-4 flex gap-2">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center justify-center gap-2 flex-1 px-6 py-3 bg-[#3794ff] hover:bg-[#2d7dd2] text-white text-sm font-semibold rounded-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0"
          >
            <Play size={18} />
            {loading ? "Analyzing..." : "Analyze Code"}
          </button>
          <button
            onClick={handleClear}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#3e3e42] hover:bg-[#4a4a4a] text-[#cccccc] text-sm font-semibold rounded-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0"
          >
            <Trash2 size={18} />
            Clear
          </button>
        </div>
      </div>
    );
  }
);
