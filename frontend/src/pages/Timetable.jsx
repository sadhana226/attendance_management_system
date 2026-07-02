import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { Calendar, Plus, Trash2, Clock, BookOpen, AlertCircle } from 'lucide-react';

const Timetable = () => {
  const { authFetch, user } = useContext(AuthContext);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('Computer Science - Sem VI');
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    subject: ''
  });

  const classes = [
    'Computer Science - Sem VI',
    'Information Technology - Sem IV'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/timetable?class=${encodeURIComponent(selectedClass)}`);
      if (res.ok) {
        const data = await res.json();
        setTimetable(data);
      }
    } catch (err) {
      setMessage({ text: err.message || 'Failed to fetch timetable.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [selectedClass]);

  const handleOpenCreate = () => {
    setFormData({
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      subject: ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this timetable slot?')) return;
    try {
      const res = await authFetch(`/api/timetable/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ text: 'Slot deleted successfully.', type: 'success' });
        fetchTimetable();
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      setMessage({ text: err.message || 'Delete failed.', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          className: selectedClass
        })
      });

      if (res.ok) {
        setMessage({ text: 'Slot added to timetable successfully!', type: 'success' });
        setIsModalOpen(false);
        fetchTimetable();
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } else {
        const data = await res.json();
        setMessage({ text: data.message || 'Submission failed.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Network error.', type: 'error' });
    }
  };

  const isStaff = user?.role !== 'student';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

      {/* Control panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Select Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="glass-input"
            style={{ width: '260px', height: '42px', borderRadius: '12px', padding: '0 14px' }}
          >
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {isStaff && (
          <button
            onClick={handleOpenCreate}
            className="glass-button"
            style={{ height: '42px', gap: '6px', boxShadow: '0 4px 15px var(--accent-glow)' }}
          >
            <Plus size={18} />
            <span>Add Slot</span>
          </button>
        )}
      </div>

      {/* Timetable grid layout */}
      <GlassCard style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
          <Calendar size={20} style={{ color: 'var(--accent-primary)' }} />
          Weekly Class Schedule Grid
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <span className="pulse-glow">Loading timetable...</span>
          </div>
        ) : (
          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Day</th>
                  <th>Schedule Slots</th>
                </tr>
              </thead>
              <tbody>
                {days.map(day => {
                  const slots = timetable
                    .filter(t => t.day === day)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime));

                  return (
                    <tr key={day}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                        {day}
                      </td>
                      <td>
                        {slots.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '6px 0' }}>
                            {slots.map(slot => (
                              <div
                                key={slot._id}
                                className="glass-panel"
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: '10px',
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  border: '1px solid rgba(255, 255, 255, 0.06)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  minWidth: '180px'
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                                    {slot.subject}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    <Clock size={12} />
                                    <span>{slot.startTime} - {slot.endTime}</span>
                                  </div>
                                </div>
                                {isStaff && (
                                  <button
                                    onClick={() => handleDelete(slot._id)}
                                    style={{
                                      marginLeft: 'auto',
                                      border: 'none',
                                      background: 'transparent',
                                      color: 'var(--status-absent)',
                                      cursor: 'pointer',
                                      padding: '2px'
                                    }}
                                    title="Remove Slot"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No lectures scheduled.</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Add Slot Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ width: '90%', maxWidth: '440px' }}>
            <GlassCard style={{ padding: '28px', border: '1px solid var(--glass-border)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '20px' }}>
                Add Schedule Slot
              </h3>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Subject Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Machine Learning"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="glass-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Day of Week</label>
                    <select
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                      className="glass-input"
                    >
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Class / Room</label>
                    <input
                      type="text"
                      disabled
                      value={selectedClass}
                      className="glass-input"
                      style={{ background: 'rgba(0,0,0,0.05)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Start Time</label>
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="glass-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>End Time</label>
                    <input
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="glass-input"
                    />
                  </div>
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
                  >
                    Save Slot
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

export default Timetable;
