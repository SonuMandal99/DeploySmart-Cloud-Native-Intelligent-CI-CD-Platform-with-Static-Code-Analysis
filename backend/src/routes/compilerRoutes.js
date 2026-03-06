const express = require('express');
const router = express.Router();
const compilerController = require('../controllers/compilerController');
const auth = require('../middleware/auth');

router.post('/run', auth.verifyToken, compilerController.run);
// new alias endpoint for frontend
router.post('/analyze', auth.verifyToken, compilerController.run);

module.exports = router;
