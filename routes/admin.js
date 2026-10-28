
const express = require('express');
const router = express.Router();
const isSignedIn = require('../middleware/is-signed-in');
const adminController = require('../controllers/admin');
const rankingController = require('../controllers/ranking');

// Show admin panel
router.get('/', isSignedIn, adminController.showAdminPanel);

// Show final ranking
router.get('/ranking', isSignedIn, rankingController.showRanking);

// Show new judge form
router.get('/judges/new', isSignedIn, adminController.showNewJudgeForm);

// Create judge
router.post('/judges', isSignedIn, adminController.createJudge);

module.exports = router;
