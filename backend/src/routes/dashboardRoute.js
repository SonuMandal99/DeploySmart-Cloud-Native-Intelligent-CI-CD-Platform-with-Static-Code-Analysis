const express = require('express');
const router = express.Router();
const CompilationReport = require('../models/CompilationReport');

/**
 * GET /api/dashboard
 * Returns dashboard statistics
 */
router.get('/dashboard', async (req, res) => {
  try {
    const reports = await CompilationReport.find().sort({ createdAt: -1 });

    const totalCompilations = reports.length;
    const totalErrors = reports.reduce((a, b) => a + b.errors, 0);
    const successCount = reports.filter(r => r.decision === "ALLOWED").length;

    const successRate = totalCompilations === 0
      ? 0
      : ((successCount / totalCompilations) * 100).toFixed(1);

    const lastDeployment = reports[0]?.decision || "NONE";

    res.json({
      totalCompilations,
      successRate,
      totalErrors,
      lastDeployment,
      history: reports.slice(0, 10)
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Dashboard service error', message: error.message });
  }
});

module.exports = router;