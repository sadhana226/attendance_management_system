import User from '../models/User.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Timetable from '../models/Timetable.js';
import LeaveRequest from '../models/LeaveRequest.js';
import AuditLog from '../models/AuditLog.js';
import { getDbMode, readFallbackDb, writeFallbackDb } from '../config/db.js';

// Helper to generate unique IDs for fallback DB
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// ==========================================
// USER SERVICES
// ==========================================

export const findUserByEmail = async (email) => {
  const cleanEmail = email.trim().toLowerCase();
  if (getDbMode()) {
    const db = readFallbackDb();
    return db.users.find(u => u.email.trim().toLowerCase() === cleanEmail) || null;
  }
  return await User.findOne({ email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } });
};

export const findUserById = async (id) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    return db.users.find(u => u._id === id) || null;
  }
  return await User.findById(id);
};

export const createUser = async (userData) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    const newUser = {
      _id: generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(newUser);
    writeFallbackDb(db);
    return newUser;
  }
  return await User.create(userData);
};

// ==========================================
// STUDENT SERVICES
// ==========================================

export const findStudents = async (filter = {}) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    let result = [...db.students];
    if (filter.class) {
      result = result.filter(s => s.class === filter.class);
    }
    return result;
  }
  return await Student.find(filter);
};

export const findStudentById = async (id) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    return db.students.find(s => s._id === id) || null;
  }
  return await Student.findById(id);
};

export const findStudentByRoll = async (rollNumber) => {
  const cleanRoll = rollNumber.trim().toUpperCase();
  if (getDbMode()) {
    const db = readFallbackDb();
    return db.students.find(s => s.rollNumber.trim().toUpperCase() === cleanRoll) || null;
  }
  return await Student.findOne({ rollNumber: { $regex: new RegExp(`^${cleanRoll}$`, 'i') } });
};

export const createStudent = async (studentData) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    const newStudent = {
      _id: generateId(),
      ...studentData,
      attendanceStats: { present: 0, absent: 0, late: 0, ...studentData.attendanceStats },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.students.push(newStudent);
    writeFallbackDb(db);
    return newStudent;
  }
  return await Student.create(studentData);
};

export const updateStudent = async (id, updateData) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    const index = db.students.findIndex(s => s._id === id);
    if (index === -1) return null;
    db.students[index] = {
      ...db.students[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeFallbackDb(db);
    return db.students[index];
  }
  return await Student.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteStudent = async (id) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    const index = db.students.findIndex(s => s._id === id);
    if (index === -1) return null;
    const deleted = db.students.splice(index, 1)[0];
    // Also delete student's attendance records
    db.attendance = db.attendance.filter(a => a.student !== id);
    writeFallbackDb(db);
    return deleted;
  }
  
  const student = await Student.findByIdAndDelete(id);
  if (student) {
    await Attendance.deleteMany({ student: id });
  }
  return student;
};

// ==========================================
// ATTENDANCE SERVICES
// ==========================================

export const findAttendance = async (filter = {}) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    let records = [...db.attendance];

    // Filter by class, subject, date
    if (filter.class) records = records.filter(r => r.class === filter.class);
    if (filter.subject) records = records.filter(r => r.subject === filter.subject);
    if (filter.date) {
      const searchDate = new Date(filter.date).toDateString();
      records = records.filter(r => new Date(r.date).toDateString() === searchDate);
    }
    if (filter.student) records = records.filter(r => r.student === filter.student);

    // Populate student info
    return records.map(record => {
      const student = db.students.find(s => s._id === record.student);
      return {
        ...record,
        student: student || { _id: record.student, name: 'Unknown Student', rollNumber: record.studentRollNumber }
      };
    });
  }

  return await Attendance.find(filter).populate('student');
};

export const upsertAttendanceRecord = async (recordData) => {
  const { studentId, studentRollNumber, className, subject, date, status, markedBy } = recordData;
  const parsedDate = new Date(date);
  
  if (getDbMode()) {
    const db = readFallbackDb();
    
    // Check if record exists
    const searchDate = parsedDate.toDateString();
    const existingIndex = db.attendance.findIndex(r => 
      r.student === studentId && 
      r.subject === subject && 
      new Date(r.date).toDateString() === searchDate
    );

    let oldStatus = null;
    let newRecord;

    if (existingIndex !== -1) {
      oldStatus = db.attendance[existingIndex].status;
      db.attendance[existingIndex] = {
        ...db.attendance[existingIndex],
        status,
        markedBy,
        updatedAt: new Date().toISOString()
      };
      newRecord = db.attendance[existingIndex];
    } else {
      newRecord = {
        _id: generateId(),
        student: studentId,
        studentRollNumber,
        class: className,
        subject,
        date: parsedDate.toISOString(),
        status,
        markedBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.attendance.push(newRecord);
    }

    // Update student stats
    const studentIndex = db.students.findIndex(s => s._id === studentId);
    if (studentIndex !== -1) {
      const stats = db.students[studentIndex].attendanceStats;
      // Revert old status
      if (oldStatus) {
        stats[oldStatus.toLowerCase()] = Math.max(0, (stats[oldStatus.toLowerCase()] || 1) - 1);
      }
      // Apply new status
      stats[status.toLowerCase()] = (stats[status.toLowerCase()] || 0) + 1;
    }

    writeFallbackDb(db);
    return newRecord;
  }

  // MongoDB mode
  // 1. Find if record already exists for student, subject on this date range
  const startOfDay = new Date(parsedDate);
  startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date(parsedDate);
  endOfDay.setHours(23,59,59,999);

  const existingRecord = await Attendance.findOne({
    student: studentId,
    subject,
    date: { $gte: startOfDay, $lte: endOfDay }
  });

  let oldStatus = null;
  let record;

  if (existingRecord) {
    oldStatus = existingRecord.status;
    existingRecord.status = status;
    existingRecord.markedBy = markedBy;
    record = await existingRecord.save();
  } else {
    record = await Attendance.create({
      student: studentId,
      studentRollNumber,
      class: className,
      subject,
      date: parsedDate,
      status,
      markedBy
    });
  }

  // Update student stats
  const student = await Student.findById(studentId);
  if (student) {
    if (oldStatus) {
      student.attendanceStats[oldStatus.toLowerCase()] = Math.max(0, student.attendanceStats[oldStatus.toLowerCase()] - 1);
    }
    student.attendanceStats[status.toLowerCase()] += 1;
    await student.save();
  }

  return record;
};

export const createStudentsBulk = async (studentsList) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    const added = [];
    for (const student of studentsList) {
      const exists = db.students.find(s => s.rollNumber === student.rollNumber);
      if (exists) continue;
      const newStudent = {
        _id: generateId(),
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        class: student.class,
        attendanceStats: { present: 0, absent: 0, late: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.students.push(newStudent);
      added.push(newStudent);
    }
    writeFallbackDb(db);
    return added;
  }

  const added = [];
  for (const student of studentsList) {
    const exists = await Student.findOne({ rollNumber: student.rollNumber });
    if (exists) continue;
    const newStudent = await Student.create({
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      class: student.class
    });
    added.push(newStudent);
  }
  return added;
};

// ==========================================
// BULK / SEEDING UTILS
// ==========================================

// ==========================================
// TIMETABLE SERVICES
// ==========================================

export const findTimetables = async (filter = {}) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    db.timetables = db.timetables || [];
    let records = [...db.timetables];
    if (filter.class) records = records.filter(t => t.class === filter.class);
    if (filter.day) records = records.filter(t => t.day === filter.day);
    return records;
  }
  return await Timetable.find(filter);
};

export const createTimetable = async (timetableData) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    db.timetables = db.timetables || [];
    const newRecord = {
      _id: generateId(),
      ...timetableData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.timetables.push(newRecord);
    writeFallbackDb(db);
    return newRecord;
  }
  return await Timetable.create(timetableData);
};

export const deleteTimetable = async (id) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    db.timetables = db.timetables || [];
    const index = db.timetables.findIndex(t => t._id === id);
    if (index === -1) return null;
    const deleted = db.timetables.splice(index, 1)[0];
    writeFallbackDb(db);
    return deleted;
  }
  return await Timetable.findByIdAndDelete(id);
};

// ==========================================
// LEAVE REQUEST SERVICES
// ==========================================

export const findLeaveRequests = async (filter = {}) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    db.leaveRequests = db.leaveRequests || [];
    let records = [...db.leaveRequests];
    if (filter.class) records = records.filter(l => l.class === filter.class);
    if (filter.student) records = records.filter(l => l.student === filter.student);
    if (filter.status) records = records.filter(l => l.status === filter.status);

    // Populate student
    return records.map(record => {
      const student = db.students.find(s => s._id === record.student);
      return {
        ...record,
        student: student || { _id: record.student, name: 'Unknown Student', rollNumber: record.studentRollNumber }
      };
    });
  }
  return await LeaveRequest.find(filter).populate('student');
};

export const createLeaveRequest = async (leaveData) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    db.leaveRequests = db.leaveRequests || [];
    const newRecord = {
      _id: generateId(),
      ...leaveData,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.leaveRequests.push(newRecord);
    writeFallbackDb(db);
    return newRecord;
  }
  return await LeaveRequest.create(leaveData);
};

export const updateLeaveStatus = async (id, status, approvedBy) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    db.leaveRequests = db.leaveRequests || [];
    const index = db.leaveRequests.findIndex(l => l._id === id);
    if (index === -1) return null;
    db.leaveRequests[index] = {
      ...db.leaveRequests[index],
      status,
      approvedBy,
      updatedAt: new Date().toISOString()
    };
    writeFallbackDb(db);
    return db.leaveRequests[index];
  }
  return await LeaveRequest.findByIdAndUpdate(id, { status, approvedBy }, { new: true });
};

// ==========================================
// AUDIT LOG SERVICES
// ==========================================

export const findAuditLogs = async (filter = {}) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    db.auditLogs = db.auditLogs || [];
    return [...db.auditLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  return await AuditLog.find(filter).sort({ timestamp: -1 });
};

export const createAuditLog = async (logData) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    db.auditLogs = db.auditLogs || [];
    const newLog = {
      _id: generateId(),
      timestamp: new Date().toISOString(),
      ...logData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.auditLogs.push(newLog);
    writeFallbackDb(db);
    return newLog;
  }
  return await AuditLog.create(logData);
};

// ==========================================
// SETTINGS SERVICES
// ==========================================

import fs from 'fs';
import path from 'path';
const settingsFilePath = path.resolve('data/settings.json');

const getSettingsFromFile = () => {
  if (!fs.existsSync(settingsFilePath)) {
    const initialSettings = {
      warningThreshold: 75,
      emailTemplate: "Dear Parent, we wish to inform you that your child, {name} (Roll: {rollNumber}), was marked ABSENT for {subject} today ({date}). Please contact the department administration for details."
    };
    fs.mkdirSync(path.dirname(settingsFilePath), { recursive: true });
    fs.writeFileSync(settingsFilePath, JSON.stringify(initialSettings, null, 2), 'utf-8');
    return initialSettings;
  }
  return JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
};

const saveSettingsToFile = (settingsData) => {
  const current = getSettingsFromFile();
  const updated = { ...current, ...settingsData };
  fs.writeFileSync(settingsFilePath, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
};

export const getSettings = async () => {
  if (getDbMode()) {
    const db = readFallbackDb();
    db.settings = db.settings || {
      warningThreshold: 75,
      emailTemplate: "Dear Parent, we wish to inform you that your child, {name} (Roll: {rollNumber}), was marked ABSENT for {subject} today ({date}). Please contact the department administration for details."
    };
    return db.settings;
  }
  return getSettingsFromFile();
};

export const saveSettings = async (settingsData) => {
  if (getDbMode()) {
    const db = readFallbackDb();
    db.settings = { ...db.settings, ...settingsData };
    writeFallbackDb(db);
    return db.settings;
  }
  return saveSettingsToFile(settingsData);
};

// ==========================================
// BULK / SEEDING UTILS
// ==========================================

export const clearDatabase = async () => {
  if (getDbMode()) {
    writeFallbackDb({ users: [], students: [], attendance: [], timetables: [], leaveRequests: [], auditLogs: [], settings: {} });
    return;
  }
  await User.deleteMany({});
  await Student.deleteMany({});
  await Attendance.deleteMany({});
  await Timetable.deleteMany({});
  await LeaveRequest.deleteMany({});
  await AuditLog.deleteMany({});
};
