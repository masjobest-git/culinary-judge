
const express = require('express');
const router = express.Router();
const isSignedIn = require('../middleware/is-signed-in');
const resultsController = require('../controllers/results');

router.get('/', isSignedIn, (req, res) => {
  if (req.user.role !== 'judge') {
    return res.status(403).send('Access denied');
  }

  res.render('judge/index');
});

router.get('/results', isSignedIn, (req, res) => {
  if (req.user.role !== 'judge') {
    return res.status(403).send('Access denied');
  }

  resultsController.showResults(req, res);
});

module.exports = router;
