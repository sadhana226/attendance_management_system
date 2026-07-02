import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { createStudent, upsertAttendanceRecord, findStudentByRoll } from './services/dbService.js';

dotenv.config();

const run = async () => {
  await connectDB();
  try {
    const roll = 'cs2023022016';
    const exists = await findStudentByRoll(roll);
    if (exists) {
      console.log(`Student with roll ${roll} is already registered!`);
      process.exit(0);
    }
    
    const student = await createStudent({
      name: 'Sanjay',
      email: 'sanjay@college.edu',
      rollNumber: roll,
      class: 'Computer Science - Sem VI'
    });
    console.log(`Created student: Sanjay (${roll})`);

    const subjects = ['Machine Learning', 'Web Engineering', 'Computer Networks'];
    const statuses = ['Present', 'Present', 'Absent', 'Present', 'Late', 'Present'];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      for (const subject of subjects) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        await upsertAttendanceRecord({
          studentId: student._id,
          studentRollNumber: roll,
          className: 'Computer Science - Sem VI',
          subject,
          date,
          status
        });
      }
    }
    console.log(`Generated attendance logs for Sanjay (${roll}).`);
    process.exit(0);
  } catch (err) {
    console.error('Registration failed:', err.message);
    process.exit(1);
  }
};

run();
