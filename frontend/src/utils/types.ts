// API Request/Response types for type-safe API calls

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

export interface AnalyzeRequest {
  code: string;
}

export interface CompilationReport {
  compilation: {
    status: "success" | "failed";
    timestamp: string;
    duration: string;
  };
  lexical: {
    status: "passed" | "failed" | "skipped";
    tokens?: number;
  };
  syntax: {
    status: "passed" | "failed" | "skipped";
    ast_nodes?: number;
  };
  semantic: {
    status: "passed" | "failed" | "skipped";
    errors: number;
    warnings: number;
  };
  ir: {
    status: "passed" | "failed" | "skipped";
    reason?: string;
  };
  deployment: {
    decision: "allowed" | "blocked";
    reason: string;
  };
}

// the backend now returns the report directly
export type AnalyzeResponse = CompilationReport;

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
