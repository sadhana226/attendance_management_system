import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { Settings as SettingsIcon, Save, AlertCircle, RefreshCw } from 'lucide-react';

const Settings = () => {
  const { authFetch } = useContext(AuthContext);
  const [warningThreshold, setWarningThreshold] = useState(75);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setWarningThreshold(data.warningThreshold || 75);
        setEmailTemplate(data.emailTemplate || '');
      }
    } catch (err) {
      setMessage({ text: 'Failed to read settings from server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await authFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warningThreshold, emailTemplate })
      });

      if (res.ok) {
        setMessage({ text: 'System configuration settings saved successfully!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } else {
        setMessage({ text: 'Failed to save configuration settings.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Save error.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setWarningThreshold(75);
    setEmailTemplate(
      "Dear Parent, we wish to inform you that your child, {name} (Roll: {rollNumber}), was marked ABSENT for {subject} today ({date}). Please contact the department administration for details."
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
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

      <GlassCard style={{ padding: '28px' }}>
        <h3 style={{ marginBottom: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem' }}>
          <SettingsIcon size={22} style={{ color: 'var(--accent-primary)' }} />
          System Settings & Notification Templates
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <span className="pulse-glow">Loading system configuration...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Warning Threshold Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Low Attendance Warning Threshold
                </label>
                <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1.05rem' }}>
                  {warningThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Students with attendance below this value will trigger parental email alerts and CRM critical highlights.
              </span>
            </div>

            {/* Email Template Config */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Parent Absent Notification Template
              </label>
              <textarea
                required
                rows={5}
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                className="glass-input"
                style={{ resize: 'none', padding: '12px 16px', fontFamily: 'inherit', fontSize: '0.85rem', lineHeight: '1.4' }}
              />
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Supported placeholders:</span>
                {['{name}', '{rollNumber}', '{subject}', '{date}'].map(tag => (
                  <span
                    key={tag}
                    onClick={() => setEmailTemplate(prev => prev + ' ' + tag)}
                    style={{
                      fontSize: '0.68rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      color: 'var(--accent-primary)'
                    }}
                    title="Click to append tag"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px' }}>
              <button
                type="button"
                className="glass-button-secondary"
                style={{ gap: '6px', fontSize: '0.85rem' }}
                onClick={handleReset}
              >
                <RefreshCw size={14} />
                <span>Reset to Default</span>
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="glass-button"
                style={{ marginLeft: 'auto', gap: '6px', fontSize: '0.85rem', boxShadow: '0 4px 15px var(--accent-glow)' }}
              >
                <Save size={14} />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>

          </form>
        )}
      </GlassCard>
    </div>
  );
};

export default Settings;
