
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Show admin panel
function showAdminPanel(req, res) {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Access denied');
  }

  res.render('admin/index');
}

// Show new judge form
function showNewJudgeForm(req, res) {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Access denied');
  }

  res.render('admin/new-judge');
}

// Create judge
async function createJudge(req, res) {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Access denied');
  }

  try {
    const existingUser = await User.findOne({
      username: req.body.username
    });

    if (existingUser) {
      return res.send('Username already exists');
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);

    const judge = new User({
      username: req.body.username,
      passwordHash: passwordHash,
      role: 'judge'
    });

    await judge.save();

    res.redirect('/admin');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error creating judge');
  }
}

module.exports = {
  showAdminPanel,
  showNewJudgeForm,
  createJudge
};
