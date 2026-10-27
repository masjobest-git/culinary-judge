
const express = require('express');
const router = express.Router();
const isSignedIn = require('../middleware/is-signed-in');
const judgeController = require('../controllers/judge');

router.get('/', isSignedIn, judgeController.showJudgePanel);

router.get('/results', isSignedIn, judgeController.showResults);

module.exports = router;
