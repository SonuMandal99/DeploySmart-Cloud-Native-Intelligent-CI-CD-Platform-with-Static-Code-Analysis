import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Navigation } from './Navigation';
import { AlertCircle, CheckCircle, XCircle, Zap } from 'lucide-react';

interface PipelineResult {
  commit: {
    hash: string;
    message: string;
    author: string;
    date: string;
  };
  report: {
    compilationStatus: string;
    errorCount: number;
    semanticErrors: any[];
  };
  deployment: {
    status: string;
    logs: string[];
  };
}

const Pipeline: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runPipeline = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a valid repository URL');
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const response = await axiosInstance.post('/github/analyze', { repoUrl });
      setResult(response.data);
    } catch (e: any) {
      const errorMessage =
        e?.response?.data?.message ||
        e?.message ||
        'Failed to run pipeline. Please check the repository URL.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      runPipeline();
    }
  };

  return (
    <>
      <Navigation />
      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-6">GitHub → Deployment Pipeline</h1>

        {/* Input Card */}
        <div className="bg-slate-800 rounded-xl shadow-md p-6 mb-6 border border-slate-700">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Repository URL
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://github.com/user/repo.git"
              className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={runPipeline}
              disabled={loading}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                loading
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running...
                </span>
              ) : (
                'Run Pipeline'
              )}
            </button>
          </div>
        </div>

        {/* Error Card */}
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-xl p-6 mb-6 flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-400 mb-1">Pipeline Error</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Commit Info Card */}
            <div className="bg-slate-800 rounded-xl shadow-md p-6 mb-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Commit Information
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-400">Hash:</span>
                  <p className="text-slate-100 font-mono text-xs break-all mt-1">
                    {result.commit.hash || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Message:</span>
                  <p className="text-slate-100 mt-1">{result.commit.message || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Author:</span>
                  <p className="text-slate-100 mt-1">{result.commit.author || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Date:</span>
                  <p className="text-slate-100 mt-1">{result.commit.date || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Compiler Status Card */}
            <div className="bg-slate-800 rounded-xl shadow-md p-6 mb-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {result.report.errorCount === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                Compiler Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.report.compilationStatus === 'success'
                        ? 'bg-green-900 bg-opacity-30 text-green-300'
                        : 'bg-red-900 bg-opacity-30 text-red-300'
                    }`}
                  >
                    {result.report.compilationStatus === 'success' ? '✓ SUCCESS' : '✗ FAILURE'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Error Count:</span>
                  <span className="text-lg font-bold">{result.report.errorCount}</span>
                </div>
                {result.report.semanticErrors && result.report.semanticErrors.length > 0 && (
                  <div>
                    <span className="text-slate-400 block mb-2">Semantic Errors:</span>
                    <ul className="space-y-1 max-h-40 overflow-y-auto">
                      {result.report.semanticErrors.map((err: any, idx: number) => (
                        <li key={idx} className="text-red-300 text-sm bg-red-900 bg-opacity-10 p-2 rounded">
                          {err.message || JSON.stringify(err)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Deployment Status Card */}
            <div className="bg-slate-800 rounded-xl shadow-md p-6 mb-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {result.deployment.status === 'DEPLOYED' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                Deployment Status
              </h2>
              <div className="mb-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${
                    result.deployment.status === 'DEPLOYED'
                      ? 'bg-green-900 bg-opacity-30 text-green-300'
                      : 'bg-red-900 bg-opacity-30 text-red-300'
                  }`}
                >
                  {result.deployment.status}
                </span>
              </div>

              {/* Deployment Logs */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3">Logs</h3>
                <div className="bg-black rounded-lg p-4 font-mono text-xs text-green-400 max-h-60 overflow-y-auto border border-slate-700">
                  {result.deployment.logs && result.deployment.logs.length > 0 ? (
                    result.deployment.logs.map((log: string, idx: number) => (
                      <div key={idx} className="whitespace-pre-wrap break-words">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500">No logs available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="text-5xl mb-4">🚀</div>
            <p className="text-center">
              Enter a GitHub repository URL to analyze and deploy
            </p>
          </div>
        )}
        </div>
      </>
    );
};

export default Pipeline;
