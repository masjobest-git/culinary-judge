
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Show admin panel
function showAdminPanel(req, res) {
  if (req.user.role !== 'admin') {
    req.session.errorMessage = 'Access denied. You do not have permission to access the Admin Panel.';
    return res.redirect('/judge');
  }

  const errorMessage = req.session.errorMessage;
  const successMessage = req.session.successMessage;

  delete req.session.errorMessage;
  delete req.session.successMessage;

  res.render('admin/index', {
    errorMessage,
    successMessage
  });
}

// Show new judge form
function showNewJudgeForm(req, res) {
  if (req.user.role !== 'admin') {
    req.session.errorMessage = 'Access denied. You do not have permission to access the Admin Panel.';
    return res.redirect('/judge');
  }

  res.render('admin/new-judge');
}

// Create judge
async function createJudge(req, res) {
  if (req.user.role !== 'admin') {
    req.session.errorMessage = 'Access denied. You do not have permission to access the Admin Panel.';
    return res.redirect('/judge');
  }

  try {
    const existingUser = await User.findOne({
      username: req.body.username
    });

    if (existingUser) {
      req.session.errorMessage = 'Username already exists.';
      return res.redirect('/admin/judges/new');
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);

    const judge = new User({
      username: req.body.username,
      passwordHash: passwordHash,
      role: 'judge'
    });

    await judge.save();

    req.session.successMessage = 'Judge created successfully!';
    res.redirect('/admin');
  } catch (error) {
    console.log(error);
    req.session.errorMessage = 'Error creating judge.';
    res.redirect('/admin/judges/new');
  }
}

module.exports = {
  showAdminPanel,
  showNewJudgeForm,
  createJudge
};
