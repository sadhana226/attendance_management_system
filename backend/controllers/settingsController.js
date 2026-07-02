import { getSettings, saveSettings, createAuditLog } from '../services/dbService.js';

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private
export const getSystemSettings = async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private
export const updateSystemSettings = async (req, res) => {
  const { warningThreshold, emailTemplate } = req.body;

  try {
    const updated = await saveSettings({
      warningThreshold: warningThreshold ? Number(warningThreshold) : undefined,
      emailTemplate
    });

    // Audit trail log
    await createAuditLog({
      operator: req.user ? req.user._id : null,
      operatorName: req.user ? req.user.name : 'Administrator',
      action: 'UPDATE_SETTINGS',
      target: 'System Configuration',
      details: `Updated warning threshold to ${warningThreshold}% and modified email warning template.`
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
