import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { Briefcase, Send, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';

const LeaveRequests = () => {
  const { authFetch, user } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  // Form states for student
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'On Duty',
    reason: '',
    documentName: ''
  });

  const isStudent = user?.role === 'student';

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const endpoint = isStudent 
        ? `/api/leaves?studentId=${user._id}` 
        : '/api/leaves';
      const res = await authFetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch (err) {
      setMessage({ text: err.message || 'Failed to fetch leave requests.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleReview = async (id, status) => {
    try {
      const res = await authFetch(`/api/leaves/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setMessage({ text: `Leave request ${status.toLowerCase()} successfully.`, type: 'success' });
        fetchLeaves();
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      setMessage({ text: err.message || 'Action failed.', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await authFetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          studentRollNumber: user.rollNumber
        })
      });

      if (res.ok) {
        setMessage({ text: 'Leave application submitted successfully!', type: 'success' });
        setFormData({
          startDate: '',
          endDate: '',
          type: 'On Duty',
          reason: '',
          documentName: ''
        });
        fetchLeaves();
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } else {
        const data = await res.json();
        setMessage({ text: data.message || 'Submission failed.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Network error.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

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

      <div style={{ display: 'grid', gridTemplateColumns: isStudent ? '1fr 1.5fr' : '1fr', gap: '24px' }}>
        
        {/* Left Side: Submit Form (Only for Students) */}
        {isStudent && (
          <GlassCard style={{ padding: '24px', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
              <Send size={18} style={{ color: 'var(--accent-primary)' }} />
              Apply for Leave / OD
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Leave / Duty Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="glass-input"
                >
                  <option value="On Duty">On Duty (OD)</option>
                  <option value="Medical Leave">Medical Leave (ML)</option>
                  <option value="Other">Other Leave</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="glass-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="glass-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Reason / Explanation</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why leave is requested..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="glass-input"
                  style={{ resize: 'none', padding: '10px 14px', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Attach Document (Mock Upload)</label>
                <input
                  type="text"
                  placeholder="e.g. medical_certificate.pdf"
                  value={formData.documentName}
                  onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                  className="glass-input"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="glass-button"
                style={{ width: '100%', marginTop: '8px', boxShadow: '0 4px 15px var(--accent-glow)' }}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </GlassCard>
        )}

        {/* Right Side: Requests History / Review List */}
        <GlassCard style={{ padding: '24px', flex: 1 }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
            <Briefcase size={20} style={{ color: 'var(--accent-primary)' }} />
            {isStudent ? 'Your Leave Applications' : 'Faculty Leave Approval Desk'}
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <span className="pulse-glow">Loading leave logs...</span>
            </div>
          ) : leaves.length > 0 ? (
            <div className="glass-table-container">
              <table className="glass-table">
                <thead>
                  <tr>
                    {!isStudent && <th>Student Details</th>}
                    <th>Leave Type</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Document</th>
                    <th>Status</th>
                    {!isStudent && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((l) => {
                    const statusColor = l.status === 'Approved' 
                      ? 'var(--status-present)' 
                      : l.status === 'Rejected' 
                      ? 'var(--status-absent)' 
                      : 'var(--status-late)';
                    const startStr = new Date(l.startDate).toLocaleDateString();
                    const endStr = new Date(l.endDate).toLocaleDateString();

                    return (
                      <tr key={l._id}>
                        {!isStudent && (
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{l.student?.name || 'Unknown'}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.studentRollNumber} ({l.class})</div>
                          </td>
                        )}
                        <td>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)'
                          }}>{l.type}</span>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{startStr} - {endStr}</td>
                        <td style={{ fontSize: '0.8rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={l.reason}>
                          {l.reason}
                        </td>
                        <td>
                          {l.documentName ? (
                            <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)' }}>
                              <FileText size={12} />
                              {l.documentName}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: statusColor, fontSize: '0.82rem' }}>
                            {l.status}
                          </span>
                        </td>
                        {!isStudent && (
                          <td>
                            {l.status === 'Pending' ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleReview(l._id, 'Approved')}
                                  style={{
                                    border: 'none', background: 'transparent', cursor: 'pointer',
                                    color: 'var(--status-present)', display: 'flex', alignItems: 'center'
                                  }}
                                  title="Approve Leave"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleReview(l._id, 'Rejected')}
                                  style={{
                                    border: 'none', background: 'transparent', cursor: 'pointer',
                                    color: 'var(--status-absent)', display: 'flex', alignItems: 'center'
                                  }}
                                  title="Reject Leave"
                                >
                                  <XCircle size={18} />
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reviewed</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              📁 No leave applications registered.
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default LeaveRequests;
