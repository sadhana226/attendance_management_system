import { findLeaveRequests, createLeaveRequest, updateLeaveStatus, findStudentByRoll, createAuditLog } from '../services/dbService.js';

// @desc    Submit a new leave request
// @route   POST /api/leaves
// @access  Private (Student Portal or Faculty Admin)
export const submitLeaveRequest = async (req, res) => {
  const { studentRollNumber, startDate, endDate, type, reason, documentName } = req.body;

  try {
    if (!studentRollNumber || !startDate || !endDate || !type || !reason) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const student = await findStudentByRoll(studentRollNumber);
    if (!student) {
      return res.status(404).json({ message: `Student with Roll Number ${studentRollNumber} not found` });
    }

    const newRequest = await createLeaveRequest({
      student: student._id,
      studentRollNumber,
      class: student.class,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      type,
      reason,
      documentName: documentName || ''
    });

    // Create Audit Log
    await createAuditLog({
      operator: req.user ? req.user._id : null,
      operatorName: req.user ? req.user.name : `Student ${studentRollNumber}`,
      action: 'SUBMIT_LEAVE',
      target: `${student.name} (${studentRollNumber})`,
      details: `Submitted a ${type} request from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all leave requests
// @route   GET /api/leaves
// @access  Private
export const getLeaveRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.class) filter.class = req.query.class;
    if (req.query.studentId) filter.student = req.query.studentId;
    if (req.query.status) filter.status = req.query.status;

    const leaves = await findLeaveRequests(filter);
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update status of a leave request (Approve/Reject)
// @route   PUT /api/leaves/:id
// @access  Private
export const reviewLeaveRequest = async (req, res) => {
  const { status } = req.body; // 'Approved' | 'Rejected'
  const { id } = req.params;

  try {
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    }

    const operatorId = req.user ? req.user._id : null;
    const operatorName = req.user ? req.user.name : 'Administrator';

    const updated = await updateLeaveStatus(id, status, operatorId);
    if (!updated) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Log the approval / rejection to Audit Trail
    await createAuditLog({
      operator: operatorId,
      operatorName,
      action: status === 'Approved' ? 'APPROVE_LEAVE' : 'REJECT_LEAVE',
      target: `Request ID ${id} (${updated.studentRollNumber})`,
      details: `${status} leave request for date range ${new Date(updated.startDate).toLocaleDateString()} - ${new Date(updated.endDate).toLocaleDateString()}`
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
