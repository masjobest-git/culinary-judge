
const resultsController = require('./results');

// Show judge dashboard
function showJudgePanel(req, res) {
  if (req.user.role !== 'judge') {
    return res.status(403).send('Access denied');
  }

  res.render('judge/index');
}

// Show evaluation results
function showResults(req, res) {
  if (req.user.role !== 'judge') {
    return res.status(403).send('Access denied');
  }

  resultsController.showResults(req, res);
}

module.exports = {
  showJudgePanel,
  showResults
};
