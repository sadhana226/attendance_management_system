import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { Lock, Mail, User, AlertCircle, ArrowRight, QrCode } from 'lucide-react';

const Login = () => {
  const { login, register, loginStudent } = useContext(AuthContext);

  // States
  const [isRegister, setIsRegister] = useState(false);
  const [isStudentLogin, setIsStudentLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isStudentLogin) {
        await loginStudent(rollNumber);
      } else if (isRegister) {
        if (!username) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        await register(username, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '85vh',
      width: '100%'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <GlassCard style={{ padding: '36px', border: '1px solid var(--glass-border)' }}>
          {/* Header brand info */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>🎓</span>
            <h1 style={{ 
              fontSize: '1.6rem', 
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '6px'
            }}>
              கற்க Portal
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 550 }}>
              {isStudentLogin 
                ? 'Sign in to access your personal dashboard' 
                : isRegister 
                ? 'Create staff administrator account' 
                : 'Sign in to access college records'}
            </p>
          </div>

          {/* Role Toggle Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.1)',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              onClick={() => { setIsStudentLogin(false); setIsRegister(false); setError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: !isStudentLogin ? 'var(--accent-primary)' : 'transparent',
                color: !isStudentLogin ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Faculty Portal
            </button>
            <button
              type="button"
              onClick={() => { setIsStudentLogin(true); setIsRegister(false); setError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: isStudentLogin ? 'var(--accent-primary)' : 'transparent',
                color: isStudentLogin ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Student Portal
            </button>
          </div>

          {/* Alert Error Box */}
          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'var(--status-absent-glow)',
              color: 'var(--status-absent)',
              border: '1px solid rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '20px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {isStudentLogin ? (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Student Roll Number
                </label>
                <div style={{ position: 'relative' }}>
                  <QrCode size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="glass-input"
                    placeholder="e.g. cs2023022026"
                    style={{ paddingLeft: '40px', height: '42px' }}
                  />
                </div>
              </div>
            ) : (
              <>
                {isRegister && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="glass-input"
                        placeholder="Enter your name"
                        style={{ paddingLeft: '40px', height: '42px' }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-input"
                      placeholder="name@college.edu"
                      style={{ paddingLeft: '40px', height: '42px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="glass-input"
                      placeholder="••••••••"
                      style={{ paddingLeft: '40px', height: '42px' }}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="glass-button"
              style={{
                width: '100%',
                height: '44px',
                marginTop: '10px',
                gap: '8px',
                boxShadow: '0 6px 20px var(--accent-glow)'
              }}
            >
              <span>
                {loading 
                  ? 'Authenticating...' 
                  : isStudentLogin 
                  ? 'Sign In as Student' 
                  : isRegister 
                  ? 'Create Account' 
                  : 'Sign In'}
              </span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Mode Switcher (Hidden for student logins) */}
          {!isStudentLogin && (
            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>
                {isRegister ? 'Already have an account?' : "Don't have an account yet?"}
              </span>
              <button
                onClick={toggleMode}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginLeft: '6px',
                  textDecoration: 'underline'
                }}
              >
                {isRegister ? 'Sign In' : 'Create One'}
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
