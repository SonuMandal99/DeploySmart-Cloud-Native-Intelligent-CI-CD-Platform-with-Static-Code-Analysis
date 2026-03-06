const Report = require('../models/Report');

exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ reports });
  } catch (err) {
    next(err);
  }
};
