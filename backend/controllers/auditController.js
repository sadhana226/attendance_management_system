import { findAuditLogs } from '../services/dbService.js';

// @desc    Get system audit logs
// @route   GET /api/audit
// @access  Private
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await findAuditLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
