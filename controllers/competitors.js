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
      box: req.body.box,
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

    let editCompetitor = null;

    if (req.query.edit) {
      editCompetitor = await Competitor.findById(req.query.edit);
    }

    res.render('competitors/index', {
      competitors: competitors,
      editCompetitor: editCompetitor,
      showNewForm: req.query.new === 'true'
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error loading competitors');
  }
}

// Show edit competitor form
async function showEditForm(req, res) {
  try {
    const competitor = await Competitor.findById(req.params.id);

    if (!competitor) {
      return res.status(404).send('Competitor not found');
    }

    res.render('competitors/edit', {
      competitor: competitor
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error loading competitor');
  }
}

// Update competitor
async function updateCompetitor(req, res) {
  try {
    const competitor = await Competitor.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        school: req.body.school,
        box: req.body.box
      },
      { runValidators: true }
    );

    if (!competitor) {
      return res.status(404).send('Competitor not found');
    }

    res.redirect('/competitors');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error updating competitor');
  }
}

// Delete competitor
async function deleteCompetitor(req, res) {
  try {
    const competitor = await Competitor.findByIdAndDelete(req.params.id);

    if (!competitor) {
      return res.status(404).send('Competitor not found');
    }

    res.redirect('/competitors');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error deleting competitor');
  }
}

module.exports = {
  showNewForm,
  createCompetitor,
  getCompetitors,
  showEditForm,
  updateCompetitor,
  deleteCompetitor
};
