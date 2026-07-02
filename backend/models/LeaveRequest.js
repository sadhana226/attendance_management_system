import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentRollNumber: { type: String, required: true },
  class: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { type: String, enum: ['On Duty', 'Medical Leave', 'Other'], required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  documentName: { type: String } // Mock uploaded filename
}, { timestamps: true });

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
export default LeaveRequest;
