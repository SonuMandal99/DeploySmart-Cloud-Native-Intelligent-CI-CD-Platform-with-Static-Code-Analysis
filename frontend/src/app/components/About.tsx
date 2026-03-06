import { Navigation } from "./Navigation";

export function About() {
  return (
    <>
      <Navigation />
      <div className="p-8">
        <h1 className="text-3xl font-semibold mb-8">About DeploySmart</h1>

        {/* Project Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
          <p className="text-slate-300 leading-relaxed">
            DeploySmart is a Cloud-Native Compiler-Aware CI/CD Platform that integrates semantic analysis and compiler intelligence into DevOps workflows. The system enforces compile-time safety guarantees and performs intelligent code analysis before deployment, bridging the gap between static code analysis and continuous integration practices.
          </p>
        </div>

        {/* System Architecture */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">System Architecture</h2>
          <div className="bg-slate-950 rounded-lg p-6 font-mono text-sm text-slate-400 space-y-2 overflow-x-auto">
            <div className="text-slate-300">GitHub Repository</div>
            <div className="text-slate-600 ml-4">↓</div>
            <div className="text-slate-300">API Controller (Express.js)</div>
            <div className="text-slate-600 ml-4">↓</div>
            <div className="text-slate-300">Compiler Engine</div>
            <div className="text-slate-500 ml-8 text-xs">(Lexical → Syntax → Semantic Analysis)</div>
            <div className="text-slate-600 ml-4">↓</div>
            <div className="text-slate-300">Intermediate Representation (IR) Generation</div>
            <div className="text-slate-600 ml-4">↓</div>
            <div className="text-slate-300">Semantic Quality Gate</div>
            <div className="text-slate-600 ml-4">↓</div>
            <div className="text-slate-300">Deployment Simulation & Analysis</div>
            <div className="text-slate-600 ml-4">↓</div>
            <div className="text-slate-300">Report Storage (MongoDB)</div>
            <div className="text-slate-600 ml-4">↓</div>
            <div className="text-slate-300">React Analytics Dashboard</div>
          </div>
        </div>

        {/* Research Contribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Research Contribution</h2>
          <div className="space-y-3 text-slate-300">
            <p className="leading-relaxed">
              <span className="font-semibold">Semantic-Aware Deployment Control:</span> Enforces compile-time safety guarantees in CI/CD pipelines through multi-stage compiler analysis, preventing unsafe code deployments before they reach production.
            </p>
            <p className="leading-relaxed">
              <span className="font-semibold">Static Analysis Integration:</span> Integrates compiler theory with DevOps practices to perform deep semantic analysis on source code, enabling intelligent deployment decisions based on code quality metrics.
            </p>
            <p className="leading-relaxed">
              <span className="font-semibold">Automated Quality Gates:</span> Implements intelligent, policy-driven quality gates that automatically enforce compliance rules without manual intervention, improving deployment reliability.
            </p>
            <p className="leading-relaxed">
              <span className="font-semibold">Compiler-Driven Governance:</span> Uses compiler analysis results as the authoritative source for deployment decisions, creating a feedback loop between code quality and deployment eligibility.
            </p>
          </div>
        </div>

        {/* Technical Implementation */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Technical Stack</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Backend</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>Node.js & Express.js</li>
                <li>MongoDB & Mongoose</li>
                <li>JWT Authentication</li>
                <li>Simple-Git Integration</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Frontend & Tools</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>React 18 + TypeScript</li>
                <li>Vite Build System</li>
                <li>TailwindCSS Framework</li>
                <li>Monaco Editor</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-800 rounded-lg p-4">
              <h3 className="font-semibold text-slate-200 mb-1">Abstract Syntax Tree (AST) Visualization</h3>
              <p className="text-xs text-slate-400">Interactive visualization and analysis of code structure through abstract syntax trees</p>
            </div>
            <div className="border border-slate-800 rounded-lg p-4">
              <h3 className="font-semibold text-slate-200 mb-1">Intermediate Representation (IR)</h3>
              <p className="text-xs text-slate-400">Generation and analysis of intermediate code representations for semantic insights</p>
            </div>
            <div className="border border-slate-800 rounded-lg p-4">
              <h3 className="font-semibold text-slate-200 mb-1">Semantic Analysis Engine</h3>
              <p className="text-xs text-slate-400">Deep code analysis identifying semantic errors and quality issues before deployment</p>
            </div>
            <div className="border border-slate-800 rounded-lg p-4">
              <h3 className="font-semibold text-slate-200 mb-1">GitHub Repository Integration</h3>
              <p className="text-xs text-slate-400">Seamless integration with GitHub repositories for automated pipeline analysis</p>
            </div>
            <div className="border border-slate-800 rounded-lg p-4">
              <h3 className="font-semibold text-slate-200 mb-1">Cloud Deployment Simulation</h3>
              <p className="text-xs text-slate-400">Safe simulation of deployment workflows and impact analysis</p>
            </div>
            <div className="border border-slate-800 rounded-lg p-4">
              <h3 className="font-semibold text-slate-200 mb-1">Analytics & Reporting</h3>
              <p className="text-xs text-slate-400">Comprehensive pipeline execution tracking and historical analysis</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
