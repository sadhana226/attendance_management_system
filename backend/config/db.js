import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

let isFallbackMode = false;
const fallbackFilePath = path.resolve('data/fallbackDb.json');

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_db';
  try {
    // Set connection timeout short so we fallback quickly if mongo is not running
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
    isFallbackMode = false;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection failed: ${error.message}`);
    console.warn('🔄 SWITCHING TO LOCAL JSON DATABASE FALLBACK MODE');
    isFallbackMode = true;
    initializeFallbackDb();
  }
};

export const getDbMode = () => isFallbackMode;

export const readFallbackDb = () => {
  if (!fs.existsSync(fallbackFilePath)) {
    initializeFallbackDb();
  }
  const data = fs.readFileSync(fallbackFilePath, 'utf-8');
  return JSON.parse(data);
};

export const writeFallbackDb = (data) => {
  const dataDir = path.dirname(fallbackFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(fallbackFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

function initializeFallbackDb() {
  const dataDir = path.dirname(fallbackFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(fallbackFilePath)) {
    const initialData = {
      users: [],
      students: [],
      attendance: []
    };
    fs.writeFileSync(fallbackFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}
