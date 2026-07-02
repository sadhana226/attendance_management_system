import jwt from 'jsonwebtoken';
import { findUserById } from '../services/dbService.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');

      // Load user database profile
      let user = await findUserById(decoded.id);
      if (!user) {
        const { findStudentById } = await import('../services/dbService.js');
        const student = await findStudentById(decoded.id);
        if (student) {
          user = {
            _id: student._id,
            name: student.name,
            username: student.name,
            email: student.email,
            rollNumber: student.rollNumber,
            class: student.class,
            role: 'student'
          };
        }
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth token validation failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
