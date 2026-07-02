import React, { useState, useContext, useEffect } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Students from './pages/Students';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Timetable from './pages/Timetable';
import LeaveRequests from './pages/LeaveRequests';
import Settings from './pages/Settings';
import StudentPortal from './pages/StudentPortal';

const MainLayout = ({ onBackToHome }) => {
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        setActiveTab('student-portal');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #090c1a 0%, #1e1e38 100%)',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Loading Portal</h2>
          <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Initializing secure connection...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show login page
  if (!user) {
    return (
      <>
        {/* Floating backdrop decoration blobs */}
        <div className="bg-blob blob-1"></div>
        <div className="bg-blob blob-2"></div>
        <div className="bg-blob blob-3"></div>
        
        <div style={{ padding: '40px 20px', maxWidth: '420px', margin: '0 auto', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%' }}>
            {/* Quick home link for unauthenticated user */}
            <button 
              onClick={onBackToHome}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem'
              }}
            >
              ← Back to Homepage
            </button>
            <Login />
          </div>
        </div>
      </>
    );
  }

  // Render tab pages
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'attendance':
        return <Attendance />;
      case 'students':
        return <Students />;
      case 'analytics':
        return <Analytics />;
      case 'timetable':
        return <Timetable />;
      case 'leaves':
        return <LeaveRequests />;
      case 'settings':
        return <Settings />;
      case 'student-portal':
        return <StudentPortal />;
      default:
        return user?.role === 'student' ? <StudentPortal /> : <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <>
      {/* Background decoration blur blobs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      {/* Main app panel framework */}
      <div 
        style={{
          display: 'flex',
          gap: '24px',
          padding: '20px',
          maxWidth: '1440px',
          margin: '0 auto',
          boxSizing: 'border-box',
          minHeight: '100vh'
        }}
      >
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onBackToHome={onBackToHome} />

        {/* Content board */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <Navbar activeTab={activeTab} />
          <main style={{ flex: 1 }}>
            {renderTabContent()}
          </main>
        </div>
      </div>
    </>
  );
};

const App = () => {
  const [viewMode, setViewMode] = useState('landing');

  return (
    <AuthProvider>
      {viewMode === 'landing' ? (
        <>
          <div className="bg-blob blob-1"></div>
          <div className="bg-blob blob-2"></div>
          <div className="bg-blob blob-3"></div>
          <Landing onLaunchPortal={() => setViewMode('portal')} />
        </>
      ) : (
        <MainLayout onBackToHome={() => setViewMode('landing')} />
      )}
    </AuthProvider>
  );
};

export default App;
