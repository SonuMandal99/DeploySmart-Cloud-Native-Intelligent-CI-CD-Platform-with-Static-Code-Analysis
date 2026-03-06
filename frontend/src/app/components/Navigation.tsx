import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Terminal, User, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-[#252526] border-b border-[#3e3e42] px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#3794ff]" />
            <span className="text-white font-medium">DeploySmart</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("/analyzer")}
              className="px-3 py-1.5 text-sm text-[#cccccc] hover:text-white hover:bg-[#2a2d2e] rounded transition-colors"
            >
              Analyzer
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-3 py-1.5 text-sm text-[#cccccc] hover:text-white hover:bg-[#2a2d2e] rounded transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/pipeline")}
              className="px-3 py-1.5 text-sm text-[#cccccc] hover:text-white hover:bg-[#2a2d2e] rounded transition-colors"
            >
              Pipeline
            </button>
            <button onClick={() => navigate("/about")} className="px-3 py-1.5 text-sm text-[#cccccc] hover:text-white hover:bg-[#2a2d2e] rounded transition-colors">
              About
            </button>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#2a2d2e] rounded transition-colors"
          >
            <div className="w-7 h-7 bg-[#3794ff] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-[#cccccc]">{user?.name}</span>
            <ChevronDown className="w-4 h-4 text-[#858585]" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#252526] border border-[#3e3e42] rounded shadow-lg z-20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#cccccc] hover:bg-[#2a2d2e] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
