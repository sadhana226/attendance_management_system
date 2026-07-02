import React from 'react';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ activeTab }) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'attendance':
        return 'Mark Attendance';
      case 'students':
        return 'Student Directory';
      case 'analytics':
        return 'Analytics & Reports';
      case 'timetable':
        return 'Weekly Timetable';
      case 'leaves':
        return 'Leave & OD Desk';
      case 'audit':
        return 'Audit & Compliance Logs';
      case 'settings':
        return 'System Settings';
      case 'student-portal':
        return 'Student Self-Service Hub';
      default:
        return 'College Attendance';
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Real-time analytics and tracking indicators';
      case 'attendance':
        return 'Record and update daily student logs';
      case 'students':
        return 'Manage profiles and specific records';
      case 'analytics':
        return 'Deep dive details and historical statistics';
      case 'timetable':
        return 'Academic schedules and classroom lecture grids';
      case 'leaves':
        return 'Student medical applications and duty approvals';
      case 'audit':
        return 'Tamper-proof records of administrator actions';
      case 'settings':
        return 'Warning thresholds and template configurations';
      case 'student-portal':
        return 'Your personal attendance metrics and performance history';
      default:
        return 'கற்க College Portal';
    }
  };

  // Formatted current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        width: '100%'
      }}
    >
      <div>
        <h1 style={{ 
          fontSize: '1.75rem', 
          fontWeight: 800, 
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          marginBottom: '4px'
        }}>
          {getTitle()}
        </h1>
        <p style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-muted)',
          fontWeight: 500 
        }}>
          {getSubtitle()}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div 
          className="glass-panel"
          style={{
            padding: '8px 16px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            background: 'var(--glass-sidebar)',
            borderRadius: '10px'
          }}
        >
          📅 {currentDate}
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Navbar;
