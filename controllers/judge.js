const resultsController = require('./results');

function showJudgePanel(req, res) {
  if (req.user.role !== 'judge') {
    req.session.errorMessage = 'Access denied. You do not have permission to access the Judge Panel.';
    return res.redirect('/admin');
  }

  const errorMessage = req.session.errorMessage;
  const successMessage = req.session.successMessage;

  delete req.session.errorMessage;
  delete req.session.successMessage;

  res.render('judge/index', {
    errorMessage,
    successMessage
  });
}

function showResults(req, res) {
  if (req.user.role !== 'judge') {
    req.session.errorMessage = 'Access denied. You do not have permission to access the Judge Panel.';
    return res.redirect('/admin');
  }

  resultsController.showResults(req, res);
}

module.exports = {
  showJudgePanel,
  showResults
};
