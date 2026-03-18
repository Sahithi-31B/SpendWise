const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for User Registration (Signup)
router.post('/register', authController.register);

// Route for User Login
router.post('/login', authController.login);

module.exports = router;