
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.username
    });

    if (!user) {
  return res.send('Invalid username or password');
}

const passwordMatch = await bcrypt.compare(
  req.body.password,
  user.passwordHash
);

if (!passwordMatch) {
  return res.send('Invalid username or password');
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
    res.status(500).send('Server error');
  }
});

module.exports = router;
