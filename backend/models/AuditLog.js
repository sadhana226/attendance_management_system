import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  operatorName: { type: String, required: true }, // e.g. "Dr. Kumar" or "Student CS2023022"
  action: { type: String, required: true },       // e.g. "CREATE_STUDENT", "EDIT_ATTENDANCE", "APPROVE_LEAVE"
  target: { type: String, required: true },       // e.g. "sanjay (cs2023022)"
  details: { type: String, required: true }       // e.g. "Changed ML attendance from Absent to Present"
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
