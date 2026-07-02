import React, { useContext } from 'react';
import { LayoutDashboard, ClipboardCheck, Users, BarChart3, LogOut, User, Calendar, Briefcase, ShieldAlert, Settings } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, onBackToHome }) => {
  const { user, logout } = useContext(AuthContext);

  const isStudent = user?.role === 'student';

  const menuItems = isStudent ? [
    { id: 'student-portal', name: 'Student Portal', icon: LayoutDashboard },
    { id: 'timetable', name: 'Class Schedule', icon: Calendar },
    { id: 'leaves', name: 'Leave / OD Request', icon: Briefcase },
  ] : [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', name: 'Mark Attendance', icon: ClipboardCheck },
    { id: 'students', name: 'Student Directory', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'timetable', name: 'Class Timetable', icon: Calendar },
    { id: 'leaves', name: 'Leave Approvals', icon: Briefcase },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div
      className="glass-panel"
      style={{
        width: 'var(--sidebar-width)',
        height: 'calc(100vh - 40px)',
        position: 'sticky',
        top: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        background: 'var(--glass-sidebar)',
        borderRight: '1px solid var(--glass-border)',
        boxSizing: 'border-box'
      }}
    >
      {/* Brand logo */}
      <div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '8px 12px', 
          marginBottom: '36px' 
        }}>
          <span style={{ fontSize: '1.8rem' }}>🎓</span>
          <div>
            <h1 style={{ 
              fontSize: '1.3rem', 
              color: 'var(--text-primary)', 
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              கற்க
            </h1>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              College Portal
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? 'var(--accent-primary)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-speed) ease',
                  boxShadow: isActive ? '0 4px 15px var(--accent-glow)' : 'none'
                }}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile section at the bottom */}
      <div 
        className="glass-panel"
        style={{
          padding: '12px',
          borderRadius: '14px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            background: 'var(--accent-glow)',
            color: 'var(--accent-primary)',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={18} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h4 style={{ 
              fontSize: '0.85rem', 
              color: 'var(--text-primary)', 
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden'
            }}>
              {user?.username || 'Teacher Account'}
            </h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role || 'Staff'}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            background: 'rgba(239, 68, 68, 0.05)',
            color: 'var(--status-absent)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--status-absent)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
            e.currentTarget.style.color = 'var(--status-absent)';
          }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
