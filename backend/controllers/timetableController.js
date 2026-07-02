import { findTimetables, createTimetable, deleteTimetable, createAuditLog } from '../services/dbService.js';

// @desc    Get timetable records
// @route   GET /api/timetable
// @access  Private
export const getTimetable = async (req, res) => {
  try {
    const filter = {};
    if (req.query.class) filter.class = req.query.class;
    if (req.query.day) filter.day = req.query.day;

    const timetable = await findTimetables(filter);
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a slot to the timetable
// @route   POST /api/timetable
// @access  Private
export const addTimetableSlot = async (req, res) => {
  const { day, startTime, endTime, className, subject } = req.body;

  try {
    if (!day || !startTime || !endTime || !className || !subject) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const newSlot = await createTimetable({
      day,
      startTime,
      endTime,
      class: className,
      subject
    });

    // Audit log
    await createAuditLog({
      operator: req.user ? req.user._id : null,
      operatorName: req.user ? req.user.name : 'Administrator',
      action: 'ADD_TIMETABLE_SLOT',
      target: className,
      details: `Added timetable slot: ${day} (${startTime} - ${endTime}) for ${subject}`
    });

    res.status(201).json(newSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a slot from the timetable
// @route   DELETE /api/timetable/:id
// @access  Private
export const removeTimetableSlot = async (req, res) => {
  try {
    const deleted = await deleteTimetable(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Timetable slot not found' });
    }

    // Audit log
    await createAuditLog({
      operator: req.user ? req.user._id : null,
      operatorName: req.user ? req.user.name : 'Administrator',
      action: 'DELETE_TIMETABLE_SLOT',
      target: deleted.class,
      details: `Removed timetable slot: ${deleted.day} (${deleted.startTime} - ${deleted.endTime}) for ${deleted.subject}`
    });

    res.json({ message: 'Slot deleted successfully', deleted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
