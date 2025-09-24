const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.register = async (req, res) => {
  try {
    // // Only admin can register users
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Only admin can register users' });
    // }

    const { username, email, password, role, ...studentData } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // For student role, ensure all required fields are provided
    if (role === 'student') {
      const requiredFields = ['name', 'studentId', 'program', 'enrollmentType', 'year', 'semester' , 'department', 'phone'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required fields for student: ${missingFields.join(', ')}`
        });
      }
    }
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      role,
      ...(role === 'student' ? studentData : {})
    });
    
    await newUser.save();
    
    // Remove password from output
    newUser.password = undefined;
    
    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }
    
    // Check if user exists and password is correct
    const user = await User.findOne({ username }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Generate token
    const token = signToken(user._id);
    
    // Remove password from output
    user.password = undefined;
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};