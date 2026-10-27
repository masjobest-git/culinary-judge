
const Competitor = require('../models/Competitor');

// Show new competitor form
function showNewForm(req, res) {
  res.render('competitors/new');
}

// Create competitor
async function createCompetitor(req, res) {
  try {
    const competitor = new Competitor({
      name: req.body.name,
      school: req.body.school,
      createdBy: req.user._id
    });

    await competitor.save();

    res.redirect('/competitors');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error creating competitor');
  }
}

// Show all competitors
async function getCompetitors(req, res) {
  try {
    const competitors = await Competitor.find();

    res.render('competitors/index', {
      competitors: competitors
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error loading competitors');
  }
}

module.exports = {
  showNewForm,
  createCompetitor,
  getCompetitors
};
