const path = require('path');
const fs = require('fs');
const os = require('os');
const { simpleGit } = require('simple-git');
const compilerService = require('../compiler/compilerService');
const Report = require('../models/Report');
const { simulateDeployment } = require('../services/deploymentService');

async function analyzeRepo(req, res, next) {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ message: 'repoUrl required' });

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    const git = simpleGit();
    await git.clone(repoUrl, tmpDir);

    const repoGit = simpleGit(tmpDir);
    const log = await repoGit.log({ n: 1 });
    const latest = log.latest || {};

    // detect main source file - support multiple languages
    const candidates = ['main.c', 'main.cpp', 'main.java', 'main.py', 'main.js'];
    let foundFile = null;
    for (const f of candidates) {
      const p = path.join(tmpDir, f);
      if (fs.existsSync(p)) {
        foundFile = p;
        break;
      }
    }
    // fallback: try to find any supported file at root
    if (!foundFile) {
      const files = fs.readdirSync(tmpDir);
      for (const f of files) {
        if (/\.(c|cpp|java|py|js)$/.test(f)) {
          foundFile = path.join(tmpDir, f);
          break;
        }
      }
    }

    if (!foundFile) {
      // cleanup
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
      return res.status(404).json({ message: 'No supported source file detected in repository' });
    }

    const content = fs.readFileSync(foundFile, 'utf8');
    
    // Detect language from file extension
    const filename = path.basename(foundFile);
    const language = compilerService.detectLanguage(filename);
    
    if (!language) {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
      return res.status(400).json({ message: 'Unsupported file type' });
    }

    // analyze using deterministic pipeline for detected language
    const analysis = compilerService.analyzeCode(content, language);

    // simulate deployment only when compilation succeeds and no semantic errors
    let deployment = { status: 'BLOCKED', logs: ['Not executed'] };
    if (analysis.compilation.status === 'success' && analysis.semantic.errors === 0) {
      deployment = await simulateDeployment({ compilationStatus: analysis.compilation.status });
    }

    // persist pipeline execution
    const reportDoc = await Report.create({
      user: req.user?.id || null,
      compilationStatus: analysis.compilation.status,
      semanticErrors: {
        count: analysis.semantic.errors,
        details: (analysis.semantic.details || []).map(d => d.message || JSON.stringify(d))
      },
      warnings: analysis.semantic.warnings,
      qualityGate: {
        complexity: analysis.qualityGate.complexity,
        codeLength: analysis.qualityGate.codeLength,
        variableCount: analysis.qualityGate.variableCount,
        warnings: analysis.qualityGate.warnings,
        securityIssues: analysis.qualityGate.securityIssues,
        securityDetails: analysis.qualityGate.securityDetails || [],
        qualityScore: analysis.qualityGate.qualityScore
      },
      ast: null,
      ir: analysis.ir.status === 'generated' ? (analysis.ir.generated || []) : [],
      repository: repoUrl,
      commitHash: latest.hash || '',
      deploymentStatus: deployment.status,
      deploymentLogs: deployment.logs || [],
      pipelineTimestamp: new Date(),
    });

    const commit = {
      hash: latest.hash || '',
      message: latest.message || '',
      author: (latest.author_name || '') + (latest.author_email ? ` <${latest.author_email}>` : ''),
      date: latest.date || ''
    };

    const payload = {
      commit,
      report: {
        language: analysis.language,
        compilationStatus: reportDoc.compilationStatus,
        semanticErrors: reportDoc.semanticErrors,
        warnings: reportDoc.warnings,
        qualityGate: reportDoc.qualityGate,
        errors: reportDoc.semanticErrors.count,
        lexicalStatus: analysis.lexical.status,
        syntaxStatus: analysis.syntax.status,
        deploymentDecision: analysis.deployment.decision,
        ast: reportDoc.ast,
        ir: reportDoc.ir
      },
      deployment: {
        status: deployment.status,
        logs: deployment.logs
      }
    };

    // cleanup
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}

    res.json(payload);
  } catch (err) {
    next(err);
  }
}

module.exports = { analyzeRepo };
