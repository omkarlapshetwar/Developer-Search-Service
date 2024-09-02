const express = require('express');
const { registerUser, loginUser, verifyEmail } = require('../services/userService');
const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);

module.exports = router;