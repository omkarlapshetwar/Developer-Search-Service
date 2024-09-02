const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');
require('dotenv').config();


exports.signup = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword, phoneNumber });
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    try {
      await emailService.sendVerificationEmail(email, otp);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return res.status(201).json({ 
        message: 'User registered successfully, but failed to send verification email',
        email,
        otpSent: false
      });
    }

    res.status(201).json({ 
      message: 'User registered successfully. Please check your email for OTP.',
      email,
      otpSent: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed', 
      details: error.message || 'An unexpected error occurred'
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp });

    if (!user) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(200).json({ 
      message: 'Email verified successfully', 
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed', details: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Email not verified. Please verify your email first.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};