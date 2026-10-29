const express = require('express');
const router = express.Router();
const isSignedIn = require('../middleware/is-signed-in');
const adminController = require('../controllers/admin');
const rankingController = require('../controllers/ranking');

// Show admin panel
router.get('/', isSignedIn, adminController.showAdminPanel);

// Show all judges
router.get('/judges', isSignedIn, adminController.showJudges);

// Show final ranking
router.get('/ranking', isSignedIn, rankingController.showRanking);

// Show new judge form
router.get('/judges/new', isSignedIn, adminController.showNewJudgeForm);

// Create judge
router.post('/judges', isSignedIn, adminController.createJudge);

// Update judge
router.post('/judges/:id/edit', isSignedIn, adminController.updateJudge);

// Delete judge
router.post('/judges/:id/delete', isSignedIn, adminController.deleteJudge);

// Show scoring groups
router.get('/scoring-groups', isSignedIn, adminController.showScoringGroups);

// Create scoring group
router.post('/scoring-groups', isSignedIn, adminController.createScoringGroup);

// Update scoring group name
router.post(
  '/scoring-groups/:id/edit',
  isSignedIn,
  adminController.updateScoringGroup
);

// Add criterion to a scoring group
router.post(
  '/scoring-groups/:id/criteria',
  isSignedIn,
  adminController.addCriterion
);

// Update criterion name, minimum and maximum points
router.post(
  '/scoring-groups/:id/criteria/:criterionId/edit',
  isSignedIn,
  adminController.updateCriterion
);

module.exports = router;