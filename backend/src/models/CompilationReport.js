const mongoose = require('mongoose');

const CompilationReportSchema = new mongoose.Schema({
  code: String,
  status: String,
  errors: Number,
  decision: String
}, { timestamps: true });

module.exports = mongoose.model('CompilationReport', CompilationReportSchema);