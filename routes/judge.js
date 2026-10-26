const express = require('express');
const router = express.Router();
const isSignedIn = require('../middleware/is-signed-in');

router.get('/', isSignedIn, (req, res) => {
  if (req.user.role !== 'judge') {
    return res.status(403).send('Access denied');
  }

  res.render('judge/index');
});

module.exports = router;