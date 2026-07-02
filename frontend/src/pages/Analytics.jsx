import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { Book, CheckCircle2, User, FileSpreadsheet, Search, RefreshCw, BarChart2 } from 'lucide-react';

const Analytics = () => {
  const { authFetch } = useContext(AuthContext);

  // States
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentHistory, setStudentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/attendance/analytics');
      
      let json;
      try {
        const text = await res.text();
        json = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error('Server returned invalid analytics format.');
      }

      if (res.ok) {
        setAnalytics(json);
      } else {
        setError(json.message || 'Failed to fetch analytics.');
      }

      // Also get all students list for history lookups
      const studentRes = await authFetch('/api/students');
      
      let studentData;
      try {
        const text = await studentRes.text();
        studentData = text ? JSON.parse(text) : [];
      } catch (e) {
        throw new Error('Server returned invalid student format.');
      }

      if (studentRes.ok) {
        setStudents(studentData);
        if (studentData.length > 0) {
          setSelectedStudentId(studentData[0]._id);
        }
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch individual history when student is selected
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedStudentId) return;
      setLoadingHistory(true);
      try {
        const res = await authFetch(`/api/attendance/student/${selectedStudentId}`);
        
        let data;
        try {
          const text = await res.text();
          data = text ? JSON.parse(text) : [];
        } catch (e) {
          throw new Error('Server returned invalid history format.');
        }

        if (res.ok) {
          // Sort history by date descending
          setStudentHistory(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [selectedStudentId]);

  const exportRosterToCsv = () => {
    if (students.length === 0) return;

    let csvContent = 'Roll Number,Name,Class,Email,Present Days,Absent Days,Late Days,Attendance Rate (%)\n';

    students.forEach(s => {
      const p = s.attendanceStats?.present || 0;
      const a = s.attendanceStats?.absent || 0;
      const l = s.attendanceStats?.late || 0;
      const total = p + a + l;
      const rate = total > 0 ? Math.round(((p + l) / total) * 100) : 100;

      const name = s.name.includes(',') ? `"${s.name}"` : s.name;
      const className = s.class.includes(',') ? `"${s.class}"` : s.class;

      csvContent += `${s.rollNumber},${name},${className},${s.email},${p},${a},${l},${rate}%\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_Roster_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-secondary)' }}>
        <div className="pulse-glow" style={{ padding: '20px', borderRadius: '12px', background: 'var(--glass-bg)' }}>
          🔄 Loading Analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--status-absent)', fontWeight: 600 }}>⚠️ Error: {error}</p>
        <button className="glass-button" style={{ marginTop: '14px' }} onClick={fetchData}>Retry</button>
      </GlassCard>
    );
  }

  // Prep Pie chart data
  const pieData = [
    { name: 'Present', value: analytics?.stats?.present || 0, color: 'var(--status-present)' },
    { name: 'Absent', value: analytics?.stats?.absent || 0, color: 'var(--status-absent)' },
    { name: 'Late', value: analytics?.stats?.late || 0, color: 'var(--status-late)' }
  ].filter(d => d.value > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top section: Donut Chart Distribution and Class Comparison */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {/* Status Ratio Pie/Donut */}
        <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }} delay={0.05}>
          <h3 style={{ width: '100%', fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-primary)' }}>
            Attendance Status Distribution
          </h3>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: '160px', height: '160px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip 
                      contentStyle={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Labels details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pieData.map((d) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: d.color }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {d.name}: {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px', color: 'var(--text-muted)' }}>No statistics compiled yet.</div>
          )}
        </GlassCard>

        {/* Class level bar charts */}
        <GlassCard style={{ padding: '24px' }} delay={0.1}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-primary)' }}>
            Class-wise Average Attendance
          </h3>
          <div style={{ width: '100%', height: '160px' }}>
            {analytics?.classData && analytics.classData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.classData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} stroke="var(--text-muted)" fontSize={10} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={9} width={90} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <Bar dataKey="rate" fill="var(--accent-secondary)" radius={[0, 4, 4, 0]} barSize={16}>
                    {analytics.classData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.rate >= 75 ? 'var(--accent-primary)' : 'var(--status-absent)'} 
                        opacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No class data.</div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Student Log Lookup and details */}
      <GlassCard style={{ padding: '24px' }} delay={0.15}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px',
          borderBottom: '1px solid var(--glass-border)',
          paddingBottom: '16px'
        }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={20} style={{ color: 'var(--accent-primary)' }} />
            Student Timeline Audit
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={exportRosterToCsv}
              className="glass-button-secondary"
              style={{ height: '36px', gap: '6px', fontSize: '0.85rem', padding: '0 14px', borderRadius: '8px' }}
              title="Download entire student register attendance stats as CSV"
            >
              <FileSpreadsheet size={16} />
              <span>Export CSV Report</span>
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Select Student:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="glass-input"
                style={{ width: '220px', height: '36px', padding: '0 10px', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Audit timeline details */}
        {loadingHistory ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
            <span className="pulse-glow" style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--glass-bg)', fontSize: '0.85rem' }}>
              🔄 Fetching history...
            </span>
          </div>
        ) : studentHistory.length > 0 ? (
          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Session Date</th>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {studentHistory.map((item) => {
                  const dateStr = new Date(item.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <tr key={item._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{dateStr}</td>
                      <td style={{ fontWeight: 500 }}>{item.subject}</td>
                      <td style={{ fontSize: '0.8rem' }}>{item.class}</td>
                      <td>
                        <span className={`status-pill ${item.status.toLowerCase()}`}>
                          {item.status === 'Present' && '🟢 '}
                          {item.status === 'Absent' && '🔴 '}
                          {item.status === 'Late' && '🟡 '}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
            📅 No attendance logs recorded yet for this student.
          </div>
        )}
      </GlassCard>

    </div>
  );
};

export default Analytics;
