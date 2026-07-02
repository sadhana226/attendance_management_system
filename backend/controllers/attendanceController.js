import { findAttendance, upsertAttendanceRecord, findStudents, getSettings } from '../services/dbService.js';

// @desc    Mark attendance for a list of students
// @route   POST /api/attendance
// @access  Private
export const markAttendance = async (req, res) => {
  const { className, subject, date, records } = req.body; // records: [{ studentId, studentRollNumber, status }]

  try {
    if (!className || !subject || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const savedRecords = [];
    const absentStudents = [];
    
    for (const item of records) {
      const record = await upsertAttendanceRecord({
        studentId: item.studentId,
        studentRollNumber: item.studentRollNumber,
        className,
        subject,
        date,
        status: item.status,
        markedBy: req.user ? req.user._id : null
      });
      savedRecords.push(record);
      
      if (item.status === 'Absent') {
        absentStudents.push(item);
      }
    }

    // Simulate Email Dispatch Alert to Parents for Absentees
    if (absentStudents.length > 0) {
      try {
        const settings = await getSettings();
        const template = settings?.emailTemplate || "Dear Parent, we wish to inform you that your child, {name} (Roll: {rollNumber}), was marked ABSENT for {subject} today ({date}). Please contact the department administration for details.";
        
        const studentRoster = await findStudents({});
        absentStudents.forEach(item => {
          const student = studentRoster.find(s => s._id.toString() === item.studentId.toString());
          const studentName = student ? student.name : 'Student';
          const studentEmail = student ? student.email : 'parent@college.edu';
          const parentEmail = `parent.${studentEmail.split('@')[0]}@college.edu`;
          
          const formattedContent = template
            .replace(/{name}/g, studentName)
            .replace(/{rollNumber}/g, item.studentRollNumber)
            .replace(/{subject}/g, subject)
            .replace(/{date}/g, new Date(date).toDateString());

          console.log('\n--- 📧 PARENT ALERT EMAIL SIMULATOR ---');
          console.log(`Host Mail Server: dispatch-success@smtp.college.edu`);
          console.log(`Recipient: ${parentEmail}`);
          console.log(`Subject: Daily Absent Alert: ${studentName}`);
          console.log(`Content: ${formattedContent}`);
          console.log('----------------------------------------\n');
        });
      } catch (err) {
        console.error('Error logging email simulator alerts:', err.message);
      }
    }

    res.status(201).json({ 
      message: 'Attendance marked successfully', 
      count: savedRecords.length,
      notifiedCount: absentStudents.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
export const getAttendanceRecords = async (req, res) => {
  const { className, subject, date } = req.query;

  try {
    const filter = {};
    if (className) filter.class = className;
    if (subject) filter.subject = subject;
    if (date) filter.date = date;

    const records = await findAttendance(filter);
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance history for a specific student
// @route   GET /api/attendance/student/:studentId
// @access  Private
export const getStudentAttendanceHistory = async (req, res) => {
  try {
    const records = await findAttendance({ student: req.params.studentId });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics and dashboard summary metrics
// @route   GET /api/attendance/analytics
// @access  Private
export const getAnalyticsSummary = async (req, res) => {
  try {
    const students = await findStudents({});
    const records = await findAttendance({});

    // Calculate overall statistics
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;

    students.forEach(student => {
      totalPresent += student.attendanceStats.present || 0;
      totalAbsent += student.attendanceStats.absent || 0;
      totalLate += student.attendanceStats.late || 0;
    });

    const totalStats = totalPresent + totalAbsent + totalLate;
    const overallRate = totalStats > 0 ? Math.round(((totalPresent + totalLate) / totalStats) * 100) : 100;

    // Read threshold from settings
    const settings = await getSettings();
    const threshold = settings?.warningThreshold || 75;

    // Student alert list (< threshold attendance)
    const alertList = students.map(student => {
      const p = student.attendanceStats.present || 0;
      const a = student.attendanceStats.absent || 0;
      const l = student.attendanceStats.late || 0;
      const total = p + a + l;
      const rate = total > 0 ? Math.round(((p + l) / total) * 100) : 100;
      return {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        class: student.class,
        attendanceRate: rate,
        stats: student.attendanceStats
      };
    })
    .filter(s => s.attendanceRate < threshold)
    .sort((a, b) => a.attendanceRate - b.attendanceRate);

    // Calculate weekly trends
    // Group records by date (last 7 days containing records)
    const trendsMap = {};
    records.forEach(r => {
      const dateStr = new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!trendsMap[dateStr]) {
        trendsMap[dateStr] = { present: 0, total: 0 };
      }
      trendsMap[dateStr].total += 1;
      if (r.status === 'Present' || r.status === 'Late') {
        trendsMap[dateStr].present += 1;
      }
    });

    const trendData = Object.keys(trendsMap).map(dateKey => ({
      date: dateKey,
      rate: Math.round((trendsMap[dateKey].present / trendsMap[dateKey].total) * 100)
    }))
    .slice(-7); // Get the last 7 dates

    // Group by subject for subject wise analysis
    const subjectMap = {};
    records.forEach(r => {
      if (!subjectMap[r.subject]) {
        subjectMap[r.subject] = { present: 0, total: 0 };
      }
      subjectMap[r.subject].total += 1;
      if (r.status === 'Present' || r.status === 'Late') {
        subjectMap[r.subject].present += 1;
      }
    });

    const subjectData = Object.keys(subjectMap).map(subject => ({
      name: subject,
      rate: Math.round((subjectMap[subject].present / subjectMap[subject].total) * 100)
    }));

    // Class level analytics
    const classMap = {};
    students.forEach(s => {
      if (!classMap[s.class]) {
        classMap[s.class] = { present: 0, absent: 0, late: 0, count: 0 };
      }
      classMap[s.class].present += s.attendanceStats.present || 0;
      classMap[s.class].absent += s.attendanceStats.absent || 0;
      classMap[s.class].late += s.attendanceStats.late || 0;
      classMap[s.class].count += 1;
    });

    const classData = Object.keys(classMap).map(className => {
      const cls = classMap[className];
      const total = cls.present + cls.absent + cls.late;
      const rate = total > 0 ? Math.round(((cls.present + cls.late) / total) * 100) : 100;
      return {
        name: className,
        rate,
        studentCount: cls.count
      };
    });

    // Discrepancy / Proxy & Bunking Alert Engine
    const proxyAlerts = [];
    const studentDatesMap = {}; // { [studentId]: { [dateOnly]: { [subject]: status } } }

    records.forEach(r => {
      const studentId = r.student._id ? r.student._id.toString() : r.student.toString();
      const dateStr = new Date(r.date).toDateString();
      const sub = r.subject;
      const status = r.status;

      if (!studentDatesMap[studentId]) studentDatesMap[studentId] = {};
      if (!studentDatesMap[studentId][dateStr]) studentDatesMap[studentId][dateStr] = {};
      studentDatesMap[studentId][dateStr][sub] = status;
    });

    Object.keys(studentDatesMap).forEach(studentId => {
      const student = students.find(s => s._id.toString() === studentId);
      if (!student) return;

      const dates = studentDatesMap[studentId];
      Object.keys(dates).forEach(dateStr => {
        const subjects = dates[dateStr];
        const statuses = Object.values(subjects);
        
        // If they have both 'Present'/'Late' AND 'Absent' on the same day
        const hasPresent = statuses.includes('Present') || statuses.includes('Late');
        const hasAbsent = statuses.includes('Absent');

        if (hasPresent && hasAbsent) {
          const presentSubjects = Object.keys(subjects).filter(s => subjects[s] === 'Present' || subjects[s] === 'Late');
          const absentSubjects = Object.keys(subjects).filter(s => subjects[s] === 'Absent');
          
          proxyAlerts.push({
            studentName: student.name,
            rollNumber: student.rollNumber,
            class: student.class,
            date: dateStr,
            presentIn: presentSubjects.join(', '),
            absentIn: absentSubjects.join(', ')
          });
        }
      });
    });

    res.json({
      overallRate,
      studentCount: students.length,
      alertCount: alertList.length,
      alertList,
      proxyAlerts,
      trendData,
      subjectData,
      classData,
      stats: {
        present: totalPresent,
        absent: totalAbsent,
        late: totalLate
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
