import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { 
  Percent, Users, CheckCircle, Clock, BookOpen, AlertTriangle, 
  FileText 
} from 'lucide-react';

const StudentPortal = () => {
  const { authFetch, user } = useContext(AuthContext);
  const [studentData, setStudentData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);

  const fetchStudentStats = async () => {
    setLoading(true);
    try {
      // 1. Fetch Student profile to get stats
      const res = await authFetch(`/api/students/${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setStudentData(data);
      }

      // 2. Fetch full attendance history
      const historyRes = await authFetch(`/api/attendance/student/${user._id}`);
      if (historyRes.ok) {
        const histData = await historyRes.json();
        setHistory(histData);
      }

      // 3. Fetch leave requests
      const leavesRes = await authFetch(`/api/leaves?studentId=${user._id}`);
      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        setLeaves(leavesData);
      }
    } catch (err) {
      console.error('Error fetching student portal data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentStats();
  }, []);

  if (loading || !studentData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-secondary)' }}>
        <div className="pulse-glow" style={{ padding: '20px', borderRadius: '12px', background: 'var(--glass-bg)' }}>
          🔄 Loading Student Dashboard...
        </div>
      </div>
    );
  }

  // Stats (Ignoring absences covered by approved leaves)
  let p = 0;
  let a = 0;
  let l = 0;
  let approvedLeaveCount = 0;

  history.forEach(r => {
    const isApprovedLeave = leaves.some(leave => {
      if (leave.status !== 'Approved') return false;
      const d = new Date(r.date);
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      d.setHours(0,0,0,0);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      return d >= start && d <= end;
    });

    if (r.status === 'Present') {
      p += 1;
    } else if (r.status === 'Late') {
      l += 1;
    } else if (r.status === 'Absent') {
      if (isApprovedLeave) {
        approvedLeaveCount += 1;
      } else {
        a += 1;
      }
    }
  });

  const total = p + a + l;
  const overallRate = total > 0 ? Math.round(((p + l) / total) * 100) : 100;



  // Aggregate by subject
  const subjectStats = {};
  history.forEach(r => {
    const sub = r.subject || 'General';
    if (!subjectStats[sub]) {
      subjectStats[sub] = { present: 0, absent: 0, late: 0, total: 0 };
    }
    
    const isApprovedLeave = leaves.some(leave => {
      if (leave.status !== 'Approved') return false;
      const d = new Date(r.date);
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      d.setHours(0,0,0,0);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      return d >= start && d <= end;
    });

    if (r.status === 'Present') {
      subjectStats[sub].present += 1;
      subjectStats[sub].total += 1;
    } else if (r.status === 'Late') {
      subjectStats[sub].late += 1;
      subjectStats[sub].total += 1;
    } else if (r.status === 'Absent') {
      if (isApprovedLeave) {
        subjectStats[sub].approvedLeave = (subjectStats[sub].approvedLeave || 0) + 1;
      } else {
        subjectStats[sub].absent += 1;
        subjectStats[sub].total += 1;
      }
    }
  });

  const subjects = Object.keys(subjectStats);



  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    const subjectRows = subjects.map(sub => {
      const stats = subjectStats[sub];
      const rate = stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 100;
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold;">${sub}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${stats.present || 0}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${stats.late || 0}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${stats.absent || 0}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${stats.total || 0}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold; color: ${rate >= 75 ? '#10b981' : '#ef4444'}">${rate}%</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>கற்க Attendance Report Card - ${studentData.name}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px double #3b82f6; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #1e3a8a; margin-bottom: 5px; }
            .meta { font-size: 14px; color: #666; }
            .card-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .detail-item { font-size: 15px; }
            .detail-label { font-weight: bold; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-size: 14px; }
            .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">கற்க - Academic Attendance Report Card</div>
            <div class="meta">Generated on ${new Date().toLocaleDateString()}</div>
          </div>
          <div class="card-details">
            <div class="detail-item"><span class="detail-label">Student Name:</span> ${studentData.name}</div>
            <div class="detail-item"><span class="detail-label">Roll Number:</span> ${studentData.rollNumber}</div>
            <div class="detail-item"><span class="detail-label">Class:</span> ${studentData.class}</div>
            <div class="detail-item"><span class="detail-label">Overall Attendance Rate:</span> ${overallRate}%</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th style="text-align: center;">Present</th>
                <th style="text-align: center;">Late</th>
                <th style="text-align: center;">Absent</th>
                <th style="text-align: center;">Total Offered</th>
                <th style="text-align: right;">Attendance Rate</th>
              </tr>
            </thead>
            <tbody>
              ${subjectRows}
            </tbody>
          </table>
          <div class="footer">
            This is an official computer-generated document from the கற்க Administration Portal.
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Student Welcome Header */}
      <GlassCard style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👋 Welcome, {studentData.name}!</span>
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Roll Number: {studentData.rollNumber} | Class: {studentData.class}
          </span>
        </div>
      </GlassCard>

      <>
          {/* Dashboard KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <GlassCard style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)', padding: '12px', borderRadius: '12px' }}>
                <Percent size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attendance Rate</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{overallRate}%</span>
                  <span style={{
                    fontSize: '0.7rem',
                    color: overallRate >= 75 ? 'var(--status-present)' : 'var(--status-absent)',
                    fontWeight: 700
                  }}>
                    {overallRate >= 75 ? 'SAFE' : 'CRITICAL'}
                  </span>
                </div>
              </div>
            </GlassCard>

            <GlassCard style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-present)', padding: '12px', borderRadius: '12px' }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Present Sessions</h4>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{p}</span>
              </div>
            </GlassCard>

            <GlassCard style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--status-late)', padding: '12px', borderRadius: '12px' }}>
                <Clock size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Late Logins</h4>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{l}</span>
              </div>
            </GlassCard>

            <GlassCard style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-absent)', padding: '12px', borderRadius: '12px' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Absences</h4>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{a}</span>
              </div>
            </GlassCard>
          </div>

          {/* Subject Breakdown cards */}
          <GlassCard style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
              <BookOpen size={18} style={{ color: 'var(--accent-primary)' }} />
              Subject-Wise Performance
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '320px', overflowY: 'auto' }}>
              {subjects.length > 0 ? (
                subjects.map(sub => {
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
                      padding: '12px 16px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{sub}</span>
                        <span style={{ fontWeight: 700, color, fontSize: '0.85rem' }}>{rate}%</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${rate}%`, height: '100%', background: color, borderRadius: '2px' }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', display: 'block', padding: '30px' }}>
                  No subject records recorded.
                </span>
              )}
            </div>

            {subjects.length > 0 && (
              <button
                onClick={handlePrintPDF}
                className="glass-button-secondary"
                style={{ width: '100%', marginTop: '16px', fontSize: '0.8rem', height: '36px', gap: '6px' }}
              >
                <FileText size={14} />
                <span>Download PDF Report Card</span>
              </button>
            )}
          </GlassCard>
        </>

    </div>
  );
};

export default StudentPortal;
