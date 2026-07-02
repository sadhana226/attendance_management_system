import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

// Load env vars
dotenv.config();

// Connect to database (MongoDB with auto JSON fallback)
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingsRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'AttendIQ College Attendance Management API is Active.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in port ${PORT}`);
});
