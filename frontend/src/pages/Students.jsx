import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { Plus, Search, Edit2, Trash2, X, Check, Mail, BookOpen, AlertCircle, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';

const StudentBreakdown = ({ studentId, authFetch }) => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchHistory = async () => {
      try {
        const res = await authFetch(`/api/attendance/student/${studentId}`);
        if (!res.ok) throw new Error('Failed to fetch attendance history.');
        const data = await res.json();
        if (active) {
          setRecords(data);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    fetchHistory();
    return () => {
      active = false;
    };
  }, [studentId, authFetch]);

  if (loading) {
    return (
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <span className="pulse-glow">Loading subject breakdown...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '16px', color: 'var(--status-absent)', fontSize: '0.9rem' }}>
        ⚠️ Error loading breakdown: {error}
      </div>
    );
  }

  // Aggregate by subject
  const subjectStats = {};
  records.forEach(r => {
    const sub = r.subject || 'Default Course';
    if (!subjectStats[sub]) {
      subjectStats[sub] = { present: 0, absent: 0, late: 0, total: 0 };
    }
    subjectStats[sub].total += 1;
    if (r.status === 'Present') subjectStats[sub].present += 1;
    else if (r.status === 'Absent') subjectStats[sub].absent += 1;
    else if (r.status === 'Late') subjectStats[sub].late += 1;
  });

  const subjects = Object.keys(subjectStats);

  if (subjects.length === 0) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No attendance records found for this student.
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px 24px',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      marginTop: '8px',
      marginBottom: '8px'
    }}>
      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BookOpen size={16} style={{ color: 'var(--accent-primary)' }} />
        Subject-Wise Attendance Breakdown
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {subjects.map(sub => {
          const stats = subjectStats[sub];
          const rate = stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 100;
          let color = 'var(--status-present)';
          if (rate < 75) color = 'var(--status-absent)';
          else if (rate < 85) color = 'var(--status-late)';

          return (
            <div key={sub} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }} title={sub}>
                  {sub}
                </span>
                <span style={{ fontWeight: 700, color, fontSize: '0.85rem' }}>{rate}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(0, 0, 0, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${rate}%`, height: '100%', background: color, borderRadius: '2px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>P: {stats.present}</span>
                <span>L: {stats.late}</span>
                <span>A: {stats.absent}</span>
                <span>Total: {stats.total}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Students = () => {
  const { authFetch } = useContext(AuthContext);

  // States
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedBracket, setSelectedBracket] = useState('All');
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentStudentId, setCurrentStudentId] = useState('');
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    className: 'Computer Science - Sem VI'
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/);
      const parsedStudents = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(',').map(c => c.trim());
        if (columns.length >= 4) {
          const [name, rollNumber, email, className] = columns;
          if (name && rollNumber && email && className) {
            parsedStudents.push({ name, rollNumber, email, class: className });
          }
        }
      }

      if (parsedStudents.length === 0) {
        setMessage({ text: 'No valid student records found in CSV. Expected columns: Name, RollNumber, Email, Class', type: 'error' });
        return;
      }

      setLoading(true);
      try {
        const res = await authFetch('/api/students/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students: parsedStudents })
        });

        let data;
        try {
          const resText = await res.text();
          data = resText ? JSON.parse(resText) : {};
        } catch (err) {
          throw new Error('Server returned invalid data format.');
        }

        if (res.ok) {
          setMessage({ text: `Successfully imported ${data.count} students!`, type: 'success' });
          fetchStudents();
          setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        } else {
          setMessage({ text: data.message || 'Bulk import failed.', type: 'error' });
        }
      } catch (err) {
        setMessage({ text: err.message || 'Connection failed.', type: 'error' });
      } finally {
        setLoading(false);
        e.target.value = ''; // Reset file input
      }
    };
    reader.readAsText(file);
  };

  const classes = [
    'Computer Science - Sem VI',
    'Information Technology - Sem IV'
  ];

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/students');
      
      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : [];
      } catch (e) {
        throw new Error('Server returned invalid response. Ensure backend is active.');
      }

      if (res.ok) {
        setStudents(data);
      } else {
        setMessage({ text: data.message || 'Failed to fetch students.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Network error.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      name: '',
      rollNumber: '',
      email: '',
      className: classes[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setModalMode('edit');
    setCurrentStudentId(student._id);
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      className: student.class
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student? All attendance records will be removed.')) return;
    
    try {
      const res = await authFetch(`/api/students/${id}`, { method: 'DELETE' });
      
      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error('Server returned invalid data format.');
      }

      if (res.ok) {
        setMessage({ text: 'Student profile deleted.', type: 'success' });
        fetchStudents();
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } else {
        setMessage({ text: data.message || 'Failed to delete student.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Network error.', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      let res;
      if (modalMode === 'create') {
        res = await authFetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        res = await authFetch(`/api/students/${currentStudentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error('Server returned invalid data format.');
      }

      if (res.ok) {
        setMessage({ 
          text: `Student ${modalMode === 'create' ? 'registered! They can now log in to the Student Portal using their Roll Number.' : 'details updated successfully!'}`, 
          type: 'success' 
        });
        setIsModalOpen(false);
        fetchStudents();
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      } else {
        setMessage({ text: data.message || 'Submission failed.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Network error.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter students by class, bracket filter & search term
  const filteredStudents = students.filter(s => {
    const matchesClass = selectedClass === 'All' || s.class === selectedClass;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Compute student attendance rate
    const p = s.attendanceStats?.present || 0;
    const a = s.attendanceStats?.absent || 0;
    const l = s.attendanceStats?.late || 0;
    const total = p + a + l;
    const rate = total > 0 ? Math.round(((p + l) / total) * 100) : 100;

    let matchesBracket = true;
    if (selectedBracket === 'Critical') {
      matchesBracket = rate < 75;
    } else if (selectedBracket === 'Warning') {
      matchesBracket = rate >= 75 && rate < 85;
    } else if (selectedBracket === 'Good') {
      matchesBracket = rate >= 85;
    }

    return matchesClass && matchesSearch && matchesBracket;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Alert Messaging */}
      {message.text && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '12px',
          background: message.type === 'success' ? 'var(--status-present-glow)' : 'var(--status-absent-glow)',
          color: message.type === 'success' ? 'var(--status-present)' : 'var(--status-absent)',
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

      {/* Control Actions Panel */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px'
      }}>
        {/* Left Side: Search & Filter */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input"
              style={{ paddingLeft: '40px', height: '42px', borderRadius: '12px' }}
            />
          </div>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="glass-input"
            style={{ width: '220px', height: '42px', borderRadius: '12px', padding: '0 14px' }}
          >
            <option value="All">All Classes</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={selectedBracket}
            onChange={(e) => setSelectedBracket(e.target.value)}
            className="glass-input"
            style={{ width: '180px', height: '42px', borderRadius: '12px', padding: '0 14px' }}
          >
            <option value="All">All Brackets</option>
            <option value="Critical">Critical (&lt;75%)</option>
            <option value="Warning">Warning (75-85%)</option>
            <option value="Good">Good (&gt;85%)</option>
          </select>
        </div>

        {/* Right Side: Add and Import Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleCsvUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="glass-button-secondary"
            style={{ height: '42px', gap: '6px', borderRadius: '12px' }}
            title="Upload CSV roster with header: Name, RollNumber, Email, Class"
          >
            <FileSpreadsheet size={16} />
            <span>Import CSV</span>
          </button>
          
          <button
            onClick={handleOpenCreate}
            className="glass-button"
            style={{ height: '42px', gap: '6px', boxShadow: '0 4px 15px var(--accent-glow)' }}
          >
            <Plus size={18} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Roster Table Layout */}
      <GlassCard style={{ padding: '20px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
            <div className="pulse-glow" style={{ padding: '16px 28px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)' }}>
              🔄 Fetching student directory...
            </div>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Class / Department</th>
                  <th>Email</th>
                  <th>Attendance Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const p = student.attendanceStats?.present || 0;
                  const a = student.attendanceStats?.absent || 0;
                  const l = student.attendanceStats?.late || 0;
                  const total = p + a + l;
                  const rate = total > 0 ? Math.round(((p + l) / total) * 100) : 100;

                  // Define percentage color
                  let rateColor = 'var(--status-present)';
                  if (rate < 75) rateColor = 'var(--status-absent)';
                  else if (rate < 85) rateColor = 'var(--status-late)';

                  const isExpanded = expandedStudentId === student._id;

                  return (
                    <React.Fragment key={student._id}>
                      <tr 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setExpandedStudentId(isExpanded ? null : student._id)}
                      >
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                            {student.rollNumber}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 550, color: 'var(--text-primary)' }}>{student.name}</div>
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>{student.class}</td>
                        <td style={{ fontSize: '0.82rem' }}>{student.email}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, color: rateColor, minWidth: '40px' }}>{rate}%</span>
                            <div style={{ flex: 1, width: '60px', height: '6px', background: 'rgba(0, 0, 0, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${rate}%`, height: '100%', background: rateColor, borderRadius: '3px' }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEdit(student)}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--accent-primary)',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Edit Student"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(student._id)}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--status-absent)',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Delete Student"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} style={{ padding: '0 16px 16px 16px', background: 'rgba(255, 255, 255, 0.01)' }}>
                            <StudentBreakdown studentId={student._id} authFetch={authFetch} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            🔍 No student profiles registered.
          </div>
        )}
      </GlassCard>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ width: '90%', maxWidth: '480px' }}>
            <GlassCard style={{ padding: '28px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  {modalMode === 'create' ? 'Register Student' : 'Edit Student Details'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="glass-input"
                    placeholder="Enter student name"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'edit'}
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    className="glass-input"
                    placeholder="e.g. CS2023025"
                    style={{ background: modalMode === 'edit' ? 'rgba(0, 0, 0, 0.05)' : '' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="glass-input"
                    placeholder="name@college.edu"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Class
                  </label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="glass-input"
                  >
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="glass-button-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="glass-button"
                    style={{ flex: 1, boxShadow: '0 4px 15px var(--accent-glow)' }}
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Student'}
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      )}

    </div>
  );
};

export default Students;
