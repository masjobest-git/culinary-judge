
const express = require('express');
const router = express.Router();
const isSignedIn = require('../middleware/is-signed-in');
const evaluationsController = require('../controllers/evaluations');
const resultsController = require('../controllers/results');

// Open evaluation form
router.get(
  '/new/:competitorId',
  isSignedIn,
  evaluationsController.showEvaluationForm
);

// Save evaluation
router.post(
  '/:competitorId',
  isSignedIn,
  evaluationsController.saveEvaluation
);

// Open correction form
router.get(
  '/:evaluationId/correct',
  isSignedIn,
  evaluationsController.showCorrectionForm
);

// Save corrected evaluation
router.post(
  '/:evaluationId/correct',
  isSignedIn,
  evaluationsController.correctEvaluation
);

// View evaluation results
router.get('/results', isSignedIn, (req, res) => {
  if (req.user.role !== 'judge') {
    return res.status(403).send('Access denied');
  }

  resultsController.showResults(req, res);
});

module.exports = router;
