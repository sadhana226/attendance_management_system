import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentRollNumber: { type: String, required: true },
  class: { type: String, required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
