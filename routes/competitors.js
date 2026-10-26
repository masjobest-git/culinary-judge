
const express = require('express');
const router = express.Router();
const Competitor = require('../models/Competitor');
const isSignedIn = require('../middleware/is-signed-in');

router.get('/new', isSignedIn, (req, res) => {
  res.render('competitors/new');
});
router.post('/', isSignedIn, async (req, res) => {
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
});

router.get('/', isSignedIn, async (req, res) => {
  const competitors = await Competitor.find();
  res.render('competitors/index', { competitors: competitors });
});

module.exports = router;
