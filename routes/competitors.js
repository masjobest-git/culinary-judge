
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

// Show edit competitor form
router.get('/:id/edit', isSignedIn, competitorsController.showEditForm);

// Update competitor
router.post('/:id/edit', isSignedIn, competitorsController.updateCompetitor);

// Delete competitor
router.post('/:id/delete', isSignedIn, competitorsController.deleteCompetitor);

module.exports = router;
