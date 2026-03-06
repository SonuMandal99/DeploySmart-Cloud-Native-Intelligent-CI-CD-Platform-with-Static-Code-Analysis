const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
// For demo purposes allow unauthenticated access. In production restore auth.verifyToken.
// const auth = require('../middleware/auth');

router.post('/analyze', githubController.analyzeRepo);

module.exports = router;
