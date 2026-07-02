import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true },   // e.g. "10:00"
  class: { type: String, required: true },      // e.g. "Computer Science - Sem VI"
  subject: { type: String, required: true }    // e.g. "Machine Learning"
}, { timestamps: true });

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;
