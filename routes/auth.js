
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Login page
router.get('/login', (req, res) => {
  const errorMessage = req.session.errorMessage;

  delete req.session.errorMessage;

  res.render('auth/login', {
    errorMessage
  });
});

// Login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.username
    });

    if (!user) {
      req.session.errorMessage = 'Invalid username or password.';
      return res.redirect('/auth/login');
    }

    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.passwordHash
    );

    if (!passwordMatch) {
      req.session.errorMessage = 'Invalid username or password.';
      return res.redirect('/auth/login');
    }

    req.session.userId = user._id;
    req.session.role = user.role;

    if (user.role === 'admin') {
      res.redirect('/admin');
    } else {
      res.redirect('/judge');
    }

  } catch (error) {
    console.log(error);
    req.session.errorMessage = 'Server error. Please try again.';
    res.redirect('/auth/login');
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.log(error);
      return res.status(500).send('Unable to log out');
    }

    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
});

module.exports = router;
