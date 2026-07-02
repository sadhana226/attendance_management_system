import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { clearDatabase, createUser, createStudent, upsertAttendanceRecord, createTimetable, createLeaveRequest, updateLeaveStatus } from '../services/dbService.js';

dotenv.config();

const seed = async () => {
  console.log('🌱 Starting Database Seeding...');
  
  // Ensure DB connection is initialized
  await connectDB();
  
  try {
    // 1. Clear existing database
    await clearDatabase();
    console.log('🧹 Cleaned existing database records.');

    // 2. Create Default Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const admin = await createUser({
      username: 'Prof. Selvakumar',
      email: 'selvakumar@college.edu',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('👤 Created default administrator user: selvakumar@college.edu / password123');

    // 3. Define Classes and Subjects
    const classes = [
      'Computer Science - Sem VI',
      'Information Technology - Sem IV'
    ];

    const subjects = {
      'Computer Science - Sem VI': ['Machine Learning', 'Web Engineering', 'Computer Networks'],
      'Information Technology - Sem IV': ['Database Systems', 'Software Engineering', 'Automata Theory']
    };

    // 4. Student Rosters
    const studentTemplates = [
      { name: 'Kavin', email: 'kavin@college.edu', rollNumber: 'CS2023001', className: classes[0] },
      { name: 'Iniya', email: 'iniya@college.edu', rollNumber: 'CS2023002', className: classes[0] },
      { name: 'Tharun', email: 'tharun@college.edu', rollNumber: 'CS2023003', className: classes[0] },
      { name: 'Ananya', email: 'ananya@college.edu', rollNumber: 'CS2023004', className: classes[0] },
      { name: 'Yazhan', email: 'yazhan@college.edu', rollNumber: 'CS2023005', className: classes[0] },
      { name: 'Karthik', email: 'karthik@college.edu', rollNumber: 'CS2023006', className: classes[0] },
      { name: 'Nila', email: 'nila@college.edu', rollNumber: 'CS2023007', className: classes[0] },
      { name: 'Diya', email: 'diya@college.edu', rollNumber: 'CS2023008', className: classes[0] },
      
      { name: 'Kishore', email: 'kishore@college.edu', rollNumber: 'IT2024001', className: classes[1] },
      { name: 'Oviya', email: 'oviya@college.edu', rollNumber: 'IT2024002', className: classes[1] },
      { name: 'Mithran', email: 'mithran@college.edu', rollNumber: 'IT2024003', className: classes[1] },
      { name: 'Dharshan', email: 'dharshan@college.edu', rollNumber: 'IT2024004', className: classes[1] },
      { name: 'Kayal', email: 'kayal@college.edu', rollNumber: 'IT2024005', className: classes[1] },
      { name: 'Mukilan', email: 'mukilan@college.edu', rollNumber: 'IT2024006', className: classes[1] }
    ];

    const students = [];
    for (const temp of studentTemplates) {
      const student = await createStudent({
        name: temp.name,
        email: temp.email,
        rollNumber: temp.rollNumber,
        class: temp.className
      });
      students.push(student);
    }
    console.log(`👨‍🎓 Created ${students.length} students across 2 classes.`);



    // 6. Generate Timetable slots
    const csSlots = [
      { day: 'Monday', startTime: '09:00', endTime: '10:00', subject: 'Machine Learning', className: classes[0] },
      { day: 'Monday', startTime: '10:00', endTime: '11:00', subject: 'Web Engineering', className: classes[0] },
      { day: 'Tuesday', startTime: '09:00', endTime: '10:00', subject: 'Computer Networks', className: classes[0] },
      { day: 'Tuesday', startTime: '11:00', endTime: '12:00', subject: 'Machine Learning', className: classes[0] },
      { day: 'Wednesday', startTime: '10:00', endTime: '11:00', subject: 'Web Engineering', className: classes[0] },
      { day: 'Wednesday', startTime: '11:00', endTime: '12:00', subject: 'Computer Networks', className: classes[0] },
      { day: 'Thursday', startTime: '09:00', endTime: '10:00', subject: 'Machine Learning', className: classes[0] },
      { day: 'Thursday', startTime: '10:00', endTime: '11:00', subject: 'Web Engineering', className: classes[0] },
      { day: 'Friday', startTime: '09:00', endTime: '10:00', subject: 'Computer Networks', className: classes[0] }
    ];

    const itSlots = [
      { day: 'Monday', startTime: '09:00', endTime: '10:00', subject: 'Database Systems', className: classes[1] },
      { day: 'Tuesday', startTime: '10:00', endTime: '11:00', subject: 'Software Engineering', className: classes[1] },
      { day: 'Wednesday', startTime: '09:00', endTime: '10:00', subject: 'Automata Theory', className: classes[1] },
      { day: 'Thursday', startTime: '10:00', endTime: '11:00', subject: 'Database Systems', className: classes[1] },
      { day: 'Friday', startTime: '11:00', endTime: '12:00', subject: 'Software Engineering', className: classes[1] }
    ];

    for (const slot of [...csSlots, ...itSlots]) {
      await createTimetable({
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        class: slot.className,
        subject: slot.subject
      });
    }
    console.log('📅 Generated default timetable slots.');



    console.log('✅ Database Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
