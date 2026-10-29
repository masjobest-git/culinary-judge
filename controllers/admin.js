const User = require('../models/User');
const ScoringGroup = require('../models/ScoringGroup');
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

// Show scoring groups and criteria
async function showScoringGroups(req, res) {
  if (req.user.role !== 'admin') {
    req.session.errorMessage = 'Access denied.';
    return res.redirect('/judge');
  }

  try {
    const scoringGroups = await ScoringGroup.find();

    const errorMessage = req.session.errorMessage;
    const successMessage = req.session.successMessage;

    delete req.session.errorMessage;
    delete req.session.successMessage;

    res.render('admin/scoring-groups', {
      scoringGroups,
      errorMessage,
      successMessage
    });
  } catch (error) {
    console.log(error);
    req.session.errorMessage = 'Error loading scoring groups.';
    res.redirect('/admin');
  }
}

// Create scoring group
async function createScoringGroup(req, res) {
  if (req.user.role !== 'admin') {
    req.session.errorMessage = 'Access denied.';
    return res.redirect('/judge');
  }

  try {
    const name = req.body.name.trim();

    if (!name) {
      req.session.errorMessage = 'Group name is required.';
      return res.redirect('/admin/scoring-groups');
    }

    const existingGroup = await ScoringGroup.findOne({ name });

    if (existingGroup) {
      req.session.errorMessage = 'This scoring group already exists.';
      return res.redirect('/admin/scoring-groups');
    }

    await ScoringGroup.create({
      name,
      criteria: []
    });

    req.session.successMessage = 'Scoring group created successfully!';
    res.redirect('/admin/scoring-groups');
  } catch (error) {
    console.log(error);
    req.session.errorMessage = 'Error creating scoring group.';
    res.redirect('/admin/scoring-groups');
  }
}

// Add criterion to a scoring group
async function addCriterion(req, res) {
  if (req.user.role !== 'admin') {
    req.session.errorMessage = 'Access denied.';
    return res.redirect('/judge');
  }

  try {
    const { name, minPoints, maxPoints } = req.body;

    const scoringGroup = await ScoringGroup.findById(req.params.id);

    if (!scoringGroup) {
      req.session.errorMessage = 'Scoring group not found.';
      return res.redirect('/admin/scoring-groups');
    }

    const min = Number(minPoints);
    const max = Number(maxPoints);

    if (
      !name ||
      !name.trim() ||
      minPoints === '' ||
      maxPoints === '' ||
      !Number.isFinite(min) ||
      !Number.isFinite(max) ||
      min < 0 ||
      max < min
    ) {
      req.session.errorMessage = 'Enter a valid criterion and point range.';
      return res.redirect('/admin/scoring-groups');
    }

    scoringGroup.criteria.push({
      name: name.trim(),
      minPoints: min,
      maxPoints: max
    });

    await scoringGroup.save();

    req.session.successMessage = 'Criterion added successfully!';
    res.redirect('/admin/scoring-groups');
  } catch (error) {
    console.log(error);
    req.session.errorMessage = 'Error adding criterion.';
    res.redirect('/admin/scoring-groups');
  }
}

module.exports = {
  showAdminPanel,
  showJudges,
  showNewJudgeForm,
  createJudge,
  updateJudge,
  deleteJudge,
  showScoringGroups,
  createScoringGroup,
  addCriterion
};