const Report = require('../models/Report');
const compilerService = require('../compiler/compilerService');

exports.run = async (req, res, next) => {
  try {
    const { code = '' } = req.body;
    if (typeof code !== 'string') {
      return res.status(400).json({ message: 'Code must be a string' });
    }

    // run the deterministic analysis pipeline
    const report = compilerService.analyzeCode(code);

    // optionally persist a simplified version for auditing
    try {
      await Report.create({
        user: req.user && req.user.id ? req.user.id : null,
        compilationStatus: report.compilation.status,
        semanticErrors: {
          count: report.semantic.errors,
          details: (report.semantic.details || []).map(d => d.message || JSON.stringify(d))
        },
        warnings: report.semantic.warnings,
        qualityGate: {
          complexity: report.qualityGate.complexity,
          codeLength: report.qualityGate.codeLength,
          variableCount: report.qualityGate.variableCount,
          warnings: report.qualityGate.warnings,
          securityIssues: report.qualityGate.securityIssues,
          securityDetails: report.qualityGate.securityDetails || [],
          qualityScore: report.qualityGate.qualityScore
        },
        ast: null,
        irGenerated: report.ir.instructions || [],
      });
    } catch (persistErr) {
      console.error('Report persistence failed:', persistErr && persistErr.message ? persistErr.message : persistErr);
    }

    res.status(200).json(report);

    // Emit real-time update to dashboard
    if (global.io) {
      global.io.emit("analysisUpdate", report);
    }
  } catch (err) {
    next(err);
  }
};
