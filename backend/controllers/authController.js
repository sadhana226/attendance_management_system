import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser, findStudentByRoll } from '../services/dbService.js';

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey123', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user (Teacher/Admin)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await createUser({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role || 'teacher'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await findUserByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate student by roll number
// @route   POST /api/auth/student-login
// @access  Public
export const studentLogin = async (req, res) => {
  const { rollNumber } = req.body;
  try {
    if (!rollNumber) {
      return res.status(400).json({ message: 'Please provide roll number' });
    }
    const student = await findStudentByRoll(rollNumber);
    if (!student) {
      return res.status(404).json({ message: `Student with roll number ${rollNumber} not registered.` });
    }
    res.json({
      _id: student._id,
      username: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      class: student.class,
      role: 'student',
      token: generateToken(student._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
