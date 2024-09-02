const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('./emailService');
require('dotenv').config();


async function registerUser(req, res) {
    const { name, email, password, phoneNumber } = req.body;
    
    try {
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
  
      let emailError = null;
      try {
        await emailService.sendVerificationEmail(email, otp);
      } catch (error) {
        console.error('Error sending verification email:', error);
        emailError = 'Failed to send verification email';
      }
  
      res.status(201).json({ 
        message: 'User registered successfully', 
        email,
        otpSent: !emailError,
        emailError
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        error: 'Registration failed', 
        details: error.message || 'An unexpected error occurred'
      });
    }
  }

async function loginUser(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ error: 'Invalid email or password' });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res.header('Authorization', token).json({ token });
}

async function verifyEmail(req, res) {
    const { email, otp } = req.body;
    
    try {
      const user = await User.findOne({ email, otp });
  
      if (!user) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }
  
      user.isVerified = true;
      user.otp = null;
      await user.save();
  
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      
      res.status(200).json({ message: 'Email verified successfully', token });
    } catch (error) {
      res.status(500).json({ error: 'Verification failed', details: error.message });
    }
  }

module.exports = { registerUser, loginUser, verifyEmail };
