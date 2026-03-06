import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  // Prefer authenticated user from context
  if (user) return <>{children}</>;

  // Fallback: allow access if an auth token exists in localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) return <>{children}</>;

  // Development convenience: if no auth system yet, allow access by returning children.
  // To enforce auth in production, replace the following line with a redirect to /login:
  // return <Navigate to="/login" replace />;
  return <>{children}</>;
}
