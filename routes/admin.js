const express = require('express');
const router = express.Router();
const User = require('../models/User');
const isSignedIn = require('../middleware/is-signed-in');

router.get('/', isSignedIn, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Access denied');
  }

  res.render('admin/index');
});

router.get('/judges/new', isSignedIn, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Access denied');
  }

  res.render('admin/new-judge');
});

router.post('/judges', isSignedIn, async (req, res) => {
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

    const bcrypt = require('bcrypt');

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
});

module.exports = router;