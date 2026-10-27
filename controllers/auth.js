
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Show login form
router.get('/login', authController.showLoginForm);

// Login user
router.post('/login', authController.loginUser);

module.exports = router;
