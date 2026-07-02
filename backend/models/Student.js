import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  class: { type: String, required: true }, // e.g., "Computer Science - Sem 6"
  attendanceStats: {
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    late: { type: Number, default: 0 }
  }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;
