const express = require('express');
const router = express.Router();
const { analyzeCode } = require('../services/analyzerService');
const CompilationReport = require('../models/CompilationReport');

/**
 * POST /api/analyze
 * Executes the deterministic compiler analyzer pipeline
 * Body: { code: string }
 * Returns: { compilation, lexical, syntax, semantic, ir, deployment }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { code } = req.body;

    if (typeof code !== 'string') {
      return res.status(400).json({ error: 'Code must be a string' });
    }

    const result = analyzeCode(code);

    // Save to database
    const report = new CompilationReport({
      code,
      status: result.compilation.status,
      errors: result.semantic.errors,
      decision: result.deployment.decision
    });
    await report.save();

    res.status(200).json(result);
  } catch (error) {
    console.error('Analyzer error:', error);
    res.status(500).json({ error: 'Analyzer service error', message: error.message });
  }
});

module.exports = router;
