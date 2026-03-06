import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Terminal } from "lucide-react";

export function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/analyzer");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Signup failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#252526] border border-[#3e3e42] rounded-lg p-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <Terminal className="w-8 h-8 text-[#3794ff]" />
              <h1 className="text-xl font-medium text-white">Compiler CI/CD</h1>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm text-[#cccccc] mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#3e3e42] rounded text-white text-sm focus:outline-none focus:border-[#3794ff] placeholder-[#858585]"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-[#cccccc] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#3e3e42] rounded text-white text-sm focus:outline-none focus:border-[#3794ff] placeholder-[#858585]"
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-[#cccccc] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#3e3e42] rounded text-white text-sm focus:outline-none focus:border-[#3794ff] placeholder-[#858585]"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-[#cccccc] mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#3e3e42] rounded text-white text-sm focus:outline-none focus:border-[#3794ff] placeholder-[#858585]"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="mb-5 p-3 bg-[#3a1f1f] border border-[#b33333] rounded text-sm text-[#f48771]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-[#3794ff] hover:bg-[#2d7dd2] text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-[#858585]">Already have an account? </span>
            <button
              onClick={() => navigate("/")}
              className="text-sm text-[#3794ff] hover:underline"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
