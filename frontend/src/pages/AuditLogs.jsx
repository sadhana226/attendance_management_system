import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { Activity, ShieldAlert, Clock, RefreshCw } from 'lucide-react';

const AuditLogs = () => {
  const { authFetch } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/audit');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    return log.action.toLowerCase().includes(term) ||
           log.operatorName.toLowerCase().includes(term) ||
           log.target.toLowerCase().includes(term) ||
           log.details.toLowerCase().includes(term);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <input
          type="text"
          placeholder="Filter audit trail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input"
          style={{ width: '280px', height: '42px', borderRadius: '12px' }}
        />

        <button
          onClick={fetchLogs}
          className="glass-button-secondary"
          style={{ height: '42px', gap: '6px', borderRadius: '12px' }}
        >
          <RefreshCw size={16} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Logs Table */}
      <GlassCard style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
          <Activity size={20} style={{ color: 'var(--accent-primary)' }} />
          Compliance Audit Trail (Security Logs)
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <span className="pulse-glow">Loading audit trail...</span>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>Timestamp</th>
                  <th>Operator</th>
                  <th>Action</th>
                  <th>Target Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => {
                  let actionColor = 'var(--text-primary)';
                  if (log.action.includes('DELETE')) actionColor = 'var(--status-absent)';
                  else if (log.action.includes('APPROVE')) actionColor = 'var(--status-present)';
                  else if (log.action.includes('UPDATE')) actionColor = 'var(--status-late)';

                  return (
                    <tr key={log._id}>
                      <td style={{ fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                          <Clock size={12} />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{log.operatorName}</td>
                      <td>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          color: actionColor
                        }}>{log.action}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', fontWeight: 550 }}>{log.target}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.details}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
            <ShieldAlert size={36} style={{ display: 'block', margin: '0 auto 12px auto', opacity: 0.3 }} />
            <span>No administrative actions logged yet.</span>
          </div>
        )}
      </GlassCard>

    </div>
  );
};

export default AuditLogs;
