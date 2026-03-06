const mongoose = require('mongoose');

const semanticErrorSchema = new mongoose.Schema({
  count: { type: Number, default: 0 },
  details: { type: [String], default: [] }
}, { _id: false });

const qualityGateSchema = new mongoose.Schema({
  complexity: { type: Number, default: 0 },
  codeLength: { type: Number, default: 0 },
  variableCount: { type: Number, default: 0 },
  warnings: { type: Number, default: 0 },
  securityIssues: { type: Number, default: 0 },
  securityDetails: { type: [String], default: [] },
  qualityScore: { type: Number, default: 100 }
}, { _id: false });

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  compilationStatus: { type: String, enum: ['success', 'failed'], required: true },
  semanticErrors: { type: semanticErrorSchema, default: {} },
  warnings: { type: Number, default: 0 },
  qualityGate: { type: qualityGateSchema, default: {} },
  irGenerated: { type: mongoose.Schema.Types.Mixed },
  ast: { type: mongoose.Schema.Types.Mixed, default: null },
  ir: { type: [String], default: [] },
  repository: { type: String },
  commitHash: { type: String },
  deploymentStatus: { type: String },
  deploymentLogs: { type: [String], default: [] },
  pipelineTimestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
