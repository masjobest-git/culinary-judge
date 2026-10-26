
const User = require('../models/User');

async function isSignedIn(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }

  const user = await User.findById(req.session.userId);

  if (!user) {
    return res.redirect('/auth/login');
  }

  req.user = user;
  next();
}

module.exports = isSignedIn;
