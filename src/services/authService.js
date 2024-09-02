const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const registerUser = async (name, email, password) => {
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateToken(user._id);
  return { user, token };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user || !(await user.isValidPassword(password))) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user._id);
  return { user, token };
};

module.exports = { registerUser, loginUser };
