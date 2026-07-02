import {
  findStudents,
  findStudentById,
  findStudentByRoll,
  createStudent,
  createStudentsBulk,
  updateStudent as updateStudentInDb,
  deleteStudent as deleteStudentFromDb
} from '../services/dbService.js';

// @desc    Get all students
// @route   GET /api/students
// @access  Private
export const getStudents = async (req, res) => {
  const { className } = req.query;
  const filter = {};
  if (className) {
    filter.class = className;
  }

  try {
    const students = await findStudents(filter);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res) => {
  try {
    const student = await findStudentById(req.params.id);
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a student
// @route   POST /api/students
// @access  Private
export const addStudent = async (req, res) => {
  const { name, rollNumber, email, className } = req.body;

  try {
    if (!name || !rollNumber || !email || !className) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    // Check roll number uniqueness
    const exists = await findStudentByRoll(rollNumber);
    if (exists) {
      return res.status(400).json({ message: 'Student with this roll number already exists' });
    }

    const student = await createStudent({
      name,
      rollNumber,
      email,
      class: className,
      attendanceStats: { present: 0, absent: 0, late: 0 }
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private
export const updateStudent = async (req, res) => {
  const { name, rollNumber, email, className } = req.body;

  try {
    const student = await findStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check unique roll number if changed
    if (rollNumber && rollNumber !== student.rollNumber) {
      const exists = await findStudentByRoll(rollNumber);
      if (exists) {
        return res.status(400).json({ message: 'Roll number already in use by another student' });
      }
    }

    const updatedData = {
      name: name || student.name,
      rollNumber: rollNumber || student.rollNumber,
      email: email || student.email,
      class: className || student.class
    };

    const updatedStudent = await updateStudentInDb(req.params.id, updatedData);
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
export const deleteStudent = async (req, res) => {
  try {
    const deleted = await deleteStudentFromDb(req.params.id);
    if (deleted) {
      res.json({ message: 'Student and associated attendance records deleted successfully' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk create students from CSV list
// @route   POST /api/students/bulk
// @access  Private
export const addStudentsBulk = async (req, res) => {
  const { students } = req.body;

  try {
    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ message: 'Invalid students list.' });
    }

    const added = await createStudentsBulk(students);
    res.status(201).json({ 
      message: `Successfully registered ${added.length} students.`, 
      count: added.length,
      students: added 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
