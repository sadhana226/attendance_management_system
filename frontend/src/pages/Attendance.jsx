import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { Search, Check, Save, UserCheck, AlertCircle } from 'lucide-react';

const Attendance = () => {
  const { authFetch } = useContext(AuthContext);

  // Parameter states
  const [selectedClass, setSelectedClass] = useState('Computer Science - Sem VI');
  const [selectedSubject, setSelectedSubject] = useState('Machine Learning');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Data states
  const [students, setStudents] = useState([]);
  const [attendanceState, setAttendanceState] = useState({}); // { [studentId]: 'Present' | 'Absent' | 'Late' }
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const classes = [
    'Computer Science - Sem VI',
    'Information Technology - Sem IV'
  ];

  const subjects = {
    'Computer Science - Sem VI': ['Machine Learning', 'Web Engineering', 'Computer Networks'],
    'Information Technology - Sem IV': ['Database Systems', 'Software Engineering', 'Automata Theory']
  };

  // Adjust subject selection if class changes and current subject is not in new class subjects list
  useEffect(() => {
    if (subjects[selectedClass] && !subjects[selectedClass].includes(selectedSubject)) {
      setSelectedSubject(subjects[selectedClass][0]);
    }
  }, [selectedClass]);

  // Auto-fill class and subject from timetable on load
  useEffect(() => {
    const autofillFromTimetable = async () => {
      try {
        const res = await authFetch('/api/timetable');
        if (res.ok) {
          const timetableData = await res.json();
          
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const todayName = dayNames[new Date().getDay()];
          
          const now = new Date();
          const currentHour = now.getHours().toString().padStart(2, '0');
          const currentMinute = now.getMinutes().toString().padStart(2, '0');
          const currentTime = `${currentHour}:${currentMinute}`;
          
          // Find matching slot for today where startTime <= currentTime && currentTime <= endTime
          const activeSlot = timetableData.find(slot => {
            return slot.day === todayName && 
                   slot.startTime <= currentTime && 
                   currentTime <= slot.endTime;
          });
          
          if (activeSlot) {
            setSelectedClass(activeSlot.class);
            setSelectedSubject(activeSlot.subject);
          }
        }
      } catch (err) {
        console.error('Failed to auto-fill timetable slot', err);
      }
    };
    autofillFromTimetable();
  }, []);

  // Fetch roster when class changes
  const fetchRoster = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await authFetch(`/api/students?className=${encodeURIComponent(selectedClass)}`);
      
      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : [];
      } catch (e) {
        throw new Error('Server returned invalid data format. Check if backend is active.');
      }

      if (res.ok) {
        setStudents(data);
        
        // Initialize attendance states, checking if there are existing records for this subject/date
        await checkExistingAttendance(data);
      } else {
        setMessage({ text: data.message || 'Failed to fetch student roster.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Network error.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Check if attendance was already recorded for this configuration
  const checkExistingAttendance = async (roster) => {
    try {
      const url = `/api/attendance?className=${encodeURIComponent(selectedClass)}&subject=${encodeURIComponent(selectedSubject)}&date=${selectedDate}`;
      const res = await authFetch(url);
      
      let data = [];
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : [];
      } catch (e) {
        console.error('Error parsing existing attendance records', e);
      }
      
      const states = {};
      
      // Default everyone to 'Present'
      roster.forEach(s => {
        states[s._id] = 'Present';
      });

      if (res.ok && data.length > 0) {
        data.forEach(record => {
          // record.student is populated, so it has student._id or is just an ID if fallback
          const studentId = record.student._id || record.student;
          states[studentId] = record.status;
        });
        setMessage({ text: 'Loaded existing attendance records for this session.', type: 'info' });
      }
      
      setAttendanceState(states);
    } catch (err) {
      console.error('Error fetching existing records:', err);
    }
  };

  // Fetch roster on startup and when parameters change
  useEffect(() => {
    fetchRoster();
  }, [selectedClass, selectedSubject, selectedDate]);

  // Set single student status
  const setStatus = (studentId, status) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Set status for all students
  const setStatusAll = (status) => {
    const nextState = { ...attendanceState };
    students.forEach(s => {
      nextState[s._id] = status;
    });
    setAttendanceState(nextState);
  };

  // Filter students based on search
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Submit attendance records
  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });

    const records = Object.keys(attendanceState).map(studentId => {
      const student = students.find(s => s._id === studentId);
      return {
        studentId,
        studentRollNumber: student ? student.rollNumber : '',
        status: attendanceState[studentId]
      };
    });

    try {
      const res = await authFetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: selectedClass,
          subject: selectedSubject,
          date: selectedDate,
          records
        })
      });

      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error('Server returned invalid data format.');
      }

      if (res.ok) {
        const msg = data.notifiedCount > 0 
          ? `Attendance recorded! Dispatched parent alerts for ${data.notifiedCount} absent students.`
          : 'Attendance recorded and stats updated successfully!';
        setMessage({ text: msg, type: 'success' });
        // Smooth timeout to clear alert
        setTimeout(() => setMessage({ text: '', type: '' }), 6000);
      } else {
        setMessage({ text: data.message || 'Failed to save attendance.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Network error.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Parameters Selector Panel */}
      <GlassCard style={{ padding: '20px' }} delay={0.05}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="glass-input"
              style={{ padding: '10px 14px', borderRadius: '10px', height: '45px' }}
            >
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="glass-input"
              style={{ padding: '10px 14px', borderRadius: '10px', height: '45px' }}
            >
              {(subjects[selectedClass] || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="glass-input"
              style={{ padding: '10px 14px', borderRadius: '10px', height: '45px' }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Roster mark action board */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Status alert message */}
        {message.text && (
          <div style={{
            padding: '12px 18px',
            borderRadius: '12px',
            background: message.type === 'success' ? 'var(--status-present-glow)' : message.type === 'error' ? 'var(--status-absent-glow)' : 'var(--accent-glow)',
            color: message.type === 'success' ? 'var(--status-present)' : message.type === 'error' ? 'var(--status-absent)' : 'var(--accent-primary)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            <AlertCircle size={18} />
            <span>{message.text}</span>
          </div>
        )}

        {/* Filter Bar & Bulk Actions */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '14px'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search student or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input"
              style={{ paddingLeft: '40px', height: '42px', borderRadius: '12px' }}
            />
          </div>

          {/* Bulk Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="glass-button-secondary"
              onClick={() => setStatusAll('Present')}
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              All Present
            </button>
            <button 
              className="glass-button-secondary"
              onClick={() => setStatusAll('Absent')}
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              All Absent
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="pulse-glow" style={{ padding: '16px 28px', borderRadius: '12px', background: 'var(--glass-bg)' }}>
              🔄 Fetching class roster...
            </div>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '18px'
          }}>
            {filteredStudents.map((student, i) => {
              const currentStatus = attendanceState[student._id] || 'Present';
              
              // Dynamic highlight border based on current state
              let stateBorder = 'var(--glass-border)';
              let glowBg = 'transparent';
              if (currentStatus === 'Present') {
                stateBorder = 'var(--status-present)';
                glowBg = 'var(--status-present-glow)';
              } else if (currentStatus === 'Absent') {
                stateBorder = 'var(--status-absent)';
                glowBg = 'var(--status-absent-glow)';
              } else if (currentStatus === 'Late') {
                stateBorder = 'var(--status-late)';
                glowBg = 'var(--status-late-glow)';
              }

              return (
                <GlassCard 
                  key={student._id} 
                  delay={i * 0.03}
                  style={{
                    padding: '16px',
                    border: `1.5px solid ${stateBorder}`,
                    background: glowBg ? `linear-gradient(135deg, var(--glass-bg) 60%, ${glowBg} 100%)` : 'var(--glass-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 650, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {student.name}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Roll: {student.rollNumber}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Email: {student.email}
                    </p>
                  </div>

                  {/* Marking switches */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '6px',
                    background: 'rgba(0, 0, 0, 0.05)',
                    padding: '4px',
                    borderRadius: '10px'
                  }}>
                    {['Present', 'Absent', 'Late'].map((status) => {
                      const isChecked = currentStatus === status;
                      
                      let selectColor = 'var(--text-secondary)';
                      let selectBg = 'transparent';
                      let btnShadow = 'none';

                      if (isChecked) {
                        if (status === 'Present') {
                          selectBg = 'var(--status-present)';
                          selectColor = '#ffffff';
                          btnShadow = '0 3px 8px var(--status-present-glow)';
                        } else if (status === 'Absent') {
                          selectBg = 'var(--status-absent)';
                          selectColor = '#ffffff';
                          btnShadow = '0 3px 8px var(--status-absent-glow)';
                        } else if (status === 'Late') {
                          selectBg = 'var(--status-late)';
                          selectColor = '#ffffff';
                          btnShadow = '0 3px 8px var(--status-late-glow)';
                        }
                      }

                      return (
                        <button
                          key={status}
                          onClick={() => setStatus(student._id, status)}
                          style={{
                            border: 'none',
                            padding: '6px 0',
                            borderRadius: '8px',
                            background: selectBg,
                            color: selectColor,
                            fontSize: '0.78rem',
                            fontWeight: isChecked ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: btnShadow
                          }}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <GlassCard style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            🔍 No students match the search criteria.
          </GlassCard>
        )}

        {/* Submit Actions */}
        {!loading && students.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="glass-button"
              style={{
                padding: '12px 28px',
                fontSize: '0.95rem',
                gap: '10px',
                boxShadow: '0 8px 24px var(--accent-glow)'
              }}
            >
              {saving ? (
                <>🔄 Saving records...</>
              ) : (
                <>
                  <Save size={18} />
                  <span>Submit Attendance</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Attendance;
