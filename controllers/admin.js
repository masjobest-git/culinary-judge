
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

// Show all judges
async function showJudges(req, res) {
  if (req.user.role !== 'admin') {
    req.session.errorMessage = 'Access denied. You do not have permission to access the Admin Panel.';
    return res.redirect('/judge');
  }

  try {
    const judges = await User.find({ role: 'judge' });

    let editJudge = null;

    if (req.query.edit) {
      editJudge = await User.findOne({
        _id: req.query.edit,
        role: 'judge'
      });
    }

    const errorMessage = req.session.errorMessage;
    const successMessage = req.session.successMessage;

    delete req.session.errorMessage;
    delete req.session.successMessage;

    res.render('admin/judges', {
      judges,
      editJudge,
      showNewForm: req.query.new === 'true',
      errorMessage,
      successMessage
    });
  } catch (error) {
    console.log(error);
    req.session.errorMessage = 'Error loading judges.';
    res.redirect('/admin');
  }
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
      return res.redirect('/admin/judges?new=true');
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);

    const judge = new User({
      username: req.body.username,
      passwordHash: passwordHash,
      role: 'judge'
    });

    await judge.save();

    req.session.successMessage = 'Judge created successfully!';
    res.redirect('/admin/judges');
  } catch (error) {
    console.log(error);
    req.session.errorMessage = 'Error creating judge.';
    res.redirect('/admin/judges?new=true');
  }
}

// Update judge
async function updateJudge(req, res) {
  if (req.user.role !== 'admin') {
    req.session.errorMessage = 'Access denied.';
    return res.redirect('/judge');
  }

  try {
    const judge = await User.findOne({
      _id: req.params.id,
      role: 'judge'
    });

    if (!judge) {
      req.session.errorMessage = 'Judge not found.';
      return res.redirect('/admin/judges');
    }

    const existingUser = await User.findOne({
      username: req.body.username,
      _id: { $ne: judge._id }
    });

    if (existingUser) {
      req.session.errorMessage = 'Username already exists.';
      return res.redirect('/admin/judges?edit=' + judge._id);
    }

    judge.username = req.body.username;
    await judge.save();

    req.session.successMessage = 'Judge updated successfully!';
    res.redirect('/admin/judges');
  } catch (error) {
    console.log(error);
    req.session.errorMessage = 'Error updating judge.';
    res.redirect('/admin/judges');
  }
}

// Delete judge
async function deleteJudge(req, res) {
  if (req.user.role !== 'admin') {
    req.session.errorMessage = 'Access denied.';
    return res.redirect('/judge');
  }

  try {
    const judge = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'judge'
    });

    if (!judge) {
      req.session.errorMessage = 'Judge not found.';
      return res.redirect('/admin/judges');
    }

    req.session.successMessage = 'Judge deleted successfully!';
    res.redirect('/admin/judges');
  } catch (error) {
    console.log(error);
    req.session.errorMessage = 'Error deleting judge.';
    res.redirect('/admin/judges');
  }
}

module.exports = {
  showAdminPanel,
  showJudges,
  showNewJudgeForm,
  createJudge,
  updateJudge,
  deleteJudge
};
