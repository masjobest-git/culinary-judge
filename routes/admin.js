
const express = require('express');
const router = express.Router();
const isSignedIn = require('../middleware/is-signed-in');
const adminController = require('../controllers/admin');

// Show admin panel
router.get('/', isSignedIn, adminController.showAdminPanel);

// Show new judge form
router.get('/judges/new', isSignedIn, adminController.showNewJudgeForm);

// Create judge
router.post('/judges', isSignedIn, adminController.createJudge);

module.exports = router;
