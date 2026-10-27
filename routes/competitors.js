
const express = require('express');
const router = express.Router();
const isSignedIn = require('../middleware/is-signed-in');
const competitorsController = require('../controllers/competitors');

// Show new competitor form
router.get('/new', isSignedIn, competitorsController.showNewForm);

// Create competitor
router.post('/', isSignedIn, competitorsController.createCompetitor);

// Show all competitors
router.get('/', isSignedIn, competitorsController.getCompetitors);

module.exports = router;
