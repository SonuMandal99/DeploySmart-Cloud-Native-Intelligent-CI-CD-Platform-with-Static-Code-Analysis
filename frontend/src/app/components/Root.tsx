import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Footer } from "./Footer";

export function Root() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect to login if not authenticated and trying to access protected routes
    if (!isLoading && !user && (location.pathname === "/analyzer" || location.pathname === "/dashboard")) {
      navigate("/");
    }
  }, [user, isLoading, location.pathname, navigate]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#3794ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#cccccc]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-white">
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
