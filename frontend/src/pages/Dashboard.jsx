import React, { useState, useEffect, useContext } from 'react';
import { 
  Percent, 
  Users, 
  AlertTriangle, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import GlassCard from '../components/GlassCard';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell
} from 'recharts';

const Dashboard = ({ setActiveTab }) => {
  const { authFetch } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  
  // New States
  const [recentLogs, setRecentLogs] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Analytics
        const res = await authFetch('/api/attendance/analytics');
        
        let json;
        try {
          const text = await res.text();
          json = text ? JSON.parse(text) : {};
        } catch (e) {
          throw new Error('Could not read server response. Check if backend is active.');
        }

        if (!res.ok) {
          throw new Error(json.message || 'Failed to fetch analytics.');
        }
        setData(json);

        // 2. Fetch Recent Attendance Records for timeline logs
        const recordRes = await authFetch('/api/attendance');
        let recordJson = [];
        try {
          const recordText = await recordRes.text();
          recordJson = recordText ? JSON.parse(recordText) : [];
        } catch (e) {
          console.error('Could not read recent activity logs', e);
        }

        if (recordRes.ok) {
          const sorted = recordJson.sort((a, b) => new Date(b.date) - new Date(a.date));
          setRecentLogs(sorted.slice(0, 5));
        }
      } catch (err) {
        setError(err.message || 'Server error.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);



  // Client-side filtering logic
  const getFilteredMetrics = () => {
    if (!data) return {};
    
    if (selectedClass === 'All') {
      return {
        overallRate: data.overallRate,
        studentCount: data.studentCount,
        alertCount: data.alertCount,
        alertList: data.alertList,
        proxyAlerts: data.proxyAlerts || [],
        subjectData: data.subjectData,
        trendData: data.trendData,
        stats: data.stats
      };
    }
    
    const classInfo = data.classData?.find(c => c.name === selectedClass);
    const sCount = classInfo ? classInfo.studentCount : 0;
    const rate = classInfo ? classInfo.rate : 0;
    
    const filteredAlerts = data.alertList?.filter(s => s.class === selectedClass) || [];
    const filteredProxy = data.proxyAlerts?.filter(s => s.class === selectedClass) || [];
    
    const csSubjects = ['Machine Learning', 'Web Engineering', 'Computer Networks'];
    const itSubjects = ['Database Systems', 'Software Engineering', 'Automata Theory'];
    const activeSubjects = selectedClass.includes('Computer Science') ? csSubjects : itSubjects;
    const filteredSubjects = data.subjectData?.filter(s => activeSubjects.includes(s.name)) || [];
    
    return {
      overallRate: rate,
      studentCount: sCount,
      alertCount: filteredAlerts.length,
      alertList: filteredAlerts,
      proxyAlerts: filteredProxy,
      subjectData: filteredSubjects,
      trendData: data.trendData,
      stats: data.stats
    };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-secondary)' }}>
        <div className="pulse-glow" style={{ padding: '20px', borderRadius: '12px', background: 'var(--glass-bg)' }}>
          🔄 Loading Analytics Data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <p style={{ color: 'var(--status-absent)', fontWeight: 600 }}>⚠️ Error: {error}</p>
        <button className="glass-button" style={{ marginTop: '14px' }} onClick={() => window.location.reload()}>Retry</button>
      </GlassCard>
    );
  }

  const metrics = getFilteredMetrics();
  const { stats } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Dropdown filter selector at the header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        gap: '12px',
        width: '100%',
        boxSizing: 'border-box' 
      }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter Roster:</span>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="glass-input"
          style={{ width: '240px', height: '38px', padding: '0 10px', borderRadius: '8px', fontSize: '0.85rem' }}
        >
          <option value="All">All Classes</option>
          <option value="Computer Science - Sem VI">Computer Science - Sem VI</option>
          <option value="Information Technology - Sem IV">Information Technology - Sem IV</option>
        </select>
      </div>

      {/* 4 Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        <StatsCard
          title="Overall Attendance"
          value={`${metrics.overallRate || 0}%`}
          icon={Percent}
          description="Classroom average rate"
          accentColor="var(--accent-primary)"
          delay={0.05}
        />
        <StatsCard
          title="Active Students"
          value={metrics.studentCount || 0}
          icon={Users}
          description="Registered on roster"
          accentColor="var(--accent-secondary)"
          delay={0.1}
        />
        <StatsCard
          title="Low Attendance Alerts"
          value={metrics.alertCount || 0}
          icon={AlertTriangle}
          description="Students below 75% target"
          trend={metrics.alertCount > 0 ? { value: `${metrics.alertCount} critical`, type: 'negative' } : null}
          accentColor={metrics.alertCount > 0 ? 'var(--status-absent)' : 'var(--status-present)'}
          delay={0.15}
        />
        <StatsCard
          title="Marked Today"
          value={stats?.present + stats?.absent + stats?.late > 0 ? "Active" : "Pending"}
          icon={Calendar}
          description="Session tracking state"
          accentColor="var(--status-late)"
          delay={0.2}
        />
      </div>

      {/* Analytics Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {/* Weekly Line Chart */}
        <GlassCard style={{ padding: '24px' }} delay={0.25}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-primary)' }}>
            Weekly Attendance Performance
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.trendData || []}>
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${v}%`} tickLine={false} />
                <Tooltip 
                  contentStyle={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="var(--accent-primary)" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2, fill: 'var(--bg-gradient)' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Subject Bar Chart */}
        <GlassCard style={{ padding: '24px' }} delay={0.3}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-primary)' }}>
            Attendance Rate by Subject
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.subjectData || []}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${v}%`} tickLine={false} />
                <Tooltip 
                  contentStyle={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                  {(metrics.subjectData || []).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.rate >= 75 ? 'var(--status-present)' : 'var(--status-absent)'} 
                      opacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Summary Breakdown */}
      <GlassCard style={{ padding: '24px' }} delay={0.4}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-primary)' }}>
          System Data Breakdown
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <div style={{ background: 'var(--status-present-glow)', color: 'var(--status-present)', padding: '8px', borderRadius: '10px' }}>
                <CheckCircle size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Present Instances</h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total student presence counts</p>
              </div>
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--status-present)' }}>{stats?.present || 0}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <div style={{ background: 'var(--status-absent-glow)', color: 'var(--status-absent)', padding: '8px', borderRadius: '10px' }}>
                <XCircle size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Absent Instances</h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total student absence counts</p>
              </div>
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--status-absent)' }}>{stats?.absent || 0}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <div style={{ background: 'var(--status-late-glow)', color: 'var(--status-late)', padding: '8px', borderRadius: '10px' }}>
                <Clock size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Late Arrivals</h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total late arrival frequencies</p>
              </div>
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--status-late)' }}>{stats?.late || 0}</span>
          </div>

          <button 
            className="glass-button" 
            style={{ width: '100%', marginTop: '12px' }}
            onClick={() => setActiveTab('attendance')}
          >
            <span>Record New Session</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </GlassCard>


      {/* Recent Activity Timeline Log */}
      <GlassCard style={{ padding: '24px' }} delay={0.45}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} style={{ color: 'var(--accent-secondary)' }} />
          Recent Session Logs
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentLogs && recentLogs.length > 0 ? (
            recentLogs.map((log) => {
              const dateStr = new Date(log.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              
              const studentName = log.student?.name || 'Student';
              const studentRoll = log.student?.rollNumber || log.studentRollNumber;
              
              return (
                <div 
                  key={log._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--glass-border)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: log.status === 'Present' ? 'var(--status-present)' : log.status === 'Absent' ? 'var(--status-absent)' : 'var(--status-late)'
                    }} />
                    <div>
                      <span style={{ fontWeight: 650, color: 'var(--text-primary)' }}>{studentName}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>({studentRoll})</span>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '12px' }}>{log.subject} - {log.class}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{dateStr}</span>
                    <span className={`status-pill ${log.status.toLowerCase()}`}>{log.status}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              🕒 No attendance sessions recorded yet.
            </div>
          )}
        </div>
      </GlassCard>

    </div>
  );
};

export default Dashboard;
