import React, { useState } from 'react';
import { 
  Percent, 
  Users, 
  Mail, 
  FileSpreadsheet, 
  Server, 
  ShieldCheck, 
  ArrowRight,
  LayoutDashboard,
  TrendingUp,
  Zap,
  Lock,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Landing = ({ onLaunchPortal }) => {
  const features = [
    {
      icon: Zap,
      title: "Real-time Slot Selection",
      desc: "Autofills course subjects and classes matching the current day and hour defined in the timetable."
    },
    {
      icon: Users,
      title: "Tamil Name Databases",
      desc: "Seeded student databases with case-insensitive, auto-trimmed login entries."
    },
    {
      icon: Mail,
      title: "Parent Alert Dispatches",
      desc: "Highlights students with attendance below threshold and simulates warning emails."
    },
    {
      icon: FileSpreadsheet,
      title: "Excel & CSV Integrations",
      desc: "Upload class registers in bulk using CSV files and export full logs easily."
    },
    {
      icon: ShieldCheck,
      title: "Resilient Storage",
      desc: "Maintains active operations with transparent local JSON storage failovers."
    },
    {
      icon: Lock,
      title: "Secure Authentications",
      desc: "Cryptographically signs logins with secure JWT tokens."
    }
  ];

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px 80px 20px',
      boxSizing: 'border-box',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '80px',
      position: 'relative'
    }}>
      {/* Premium Light Mode Styles and Keyframe Animations */}
      <style>{`
        body {
          background-color: #f8fafc;
          color: #0f172a;
          background-image: 
            radial-gradient(rgba(79, 70, 229, 0.05) 1.5px, transparent 0),
            radial-gradient(rgba(79, 70, 229, 0.03) 1px, transparent 0);
          background-size: 32px 32px, 16px 16px;
          background-position: 0 0, 8px 8px;
        }

        @keyframes float-slow {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.03); }
          100% { transform: translateY(0px) scale(1); }
        }

        .light-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.25;
          z-index: -1;
          pointer-events: none;
          animation: float-slow 12s infinite alternate ease-in-out;
        }

        .light-glow-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #c7d2fe 0%, transparent 70%);
          top: -10%;
          right: -5%;
        }

        .light-glow-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #e9d5ff 0%, transparent 70%);
          bottom: 15%;
          left: -5%;
          animation-delay: 3s;
        }

        .light-card {
          background: rgba(255, 255, 255, 0.7) !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.7) !important;
          box-shadow: 0 10px 30px rgba(79, 70, 229, 0.04) !important;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .light-card:hover {
          transform: translateY(-6px);
          border-color: rgba(79, 70, 229, 0.2) !important;
          box-shadow: 
            0 20px 40px rgba(79, 70, 229, 0.08),
            0 1px 3px rgba(79, 70, 229, 0.02) !important;
        }

        .primary-button {
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          color: white !important;
          border: none;
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.2);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(79, 70, 229, 0.3);
        }

        .secondary-button {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(79, 70, 229, 0.15);
          color: #4f46e5 !important;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .secondary-button:hover {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(79, 70, 229, 0.3);
          transform: translateY(-2px);
        }
      `}</style>

      <div className="light-glow light-glow-1" />
      <div className="light-glow light-glow-2" />

      {/* 1. Header Navigation */}
      <header 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 32px',
          marginTop: '20px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
          position: 'sticky',
          top: '20px',
          zIndex: 100
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.8rem' }}>🎓</span>
          <span style={{ 
            fontSize: '1.4rem', 
            fontWeight: 800, 
            fontFamily: 'var(--font-display)',
            background: 'linear-gradient(to right, #4f46e5, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px'
          }}>
            கற்க
          </span>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="#features" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#4f46e5'} onMouseLeave={(e)=>e.target.style.color='#475569'}>Features</a>
          <button 
            onClick={onLaunchPortal}
            className="primary-button"
            style={{ 
              padding: '10px 22px', 
              fontSize: '0.85rem',
              borderRadius: '12px'
            }}
          >
            <span>Launch Portal</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '60px',
        alignItems: 'center',
        marginTop: '20px'
      }}>
        {/* Left text panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <span style={{
            alignSelf: 'flex-start',
            padding: '6px 14px',
            borderRadius: '30px',
            background: 'rgba(79, 70, 229, 0.08)',
            color: '#4f46e5',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: '1px solid rgba(79, 70, 229, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CheckCircle2 size={12} />
            Karka College Portal Active
          </span>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 3.6rem)',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            color: '#0f172a',
            lineHeight: 1.15,
            letterSpacing: '-1.5px'
          }}>
            Classroom <br />
            <span style={{
              background: 'linear-gradient(to right, #4f46e5, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Attendance Hub
            </span>
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: '#475569',
            lineHeight: 1.65,
            maxWidth: '480px'
          }}>
            Manage student directories, register timetables, log attendance, request On-Duty leaves, and compile subject ratios in one cohesive, secure, and responsive dashboard.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '10px' }}>
            <button 
              onClick={onLaunchPortal}
              className="primary-button"
              style={{
                padding: '14px 32px',
                fontSize: '0.95rem',
                borderRadius: '14px'
              }}
            >
              <span>Launch Portal</span>
              <ArrowRight size={16} />
            </button>
            <a 
              href="#features"
              className="secondary-button"
              style={{
                padding: '14px 32px',
                fontSize: '0.95rem',
                borderRadius: '14px',
                textDecoration: 'none'
              }}
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Right dashboard mockup widget */}
        <div style={{
          background: '#ffffff',
          border: '1px solid rgba(79, 70, 229, 0.08)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 30px 60px rgba(79, 70, 229, 0.06)',
          position: 'relative'
        }}>
          {/* Mockup header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '8px', fontWeight: 600 }}>கற்க_Preview.xlsx</span>
            </div>
            <LayoutDashboard size={16} style={{ color: '#4f46e5' }} />
          </div>

          {/* KPI metrics row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 600 }}>AVERAGE RATE</span>
              <h4 style={{ fontSize: '1.25rem', color: '#0f172a', marginTop: '4px', fontWeight: 700 }}>96.8%</h4>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 600 }}>TOTAL STUDENTS</span>
              <h4 style={{ fontSize: '1.25rem', color: '#0f172a', marginTop: '4px', fontWeight: 700 }}>14 Seeded</h4>
            </div>
          </div>

          {/* Student list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>Recent Activity Logs</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px' }}>
              <span style={{ color: '#1e293b', fontWeight: 600 }}>Kavin (CS2023001)</span>
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>Present</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px' }}>
              <span style={{ color: '#1e293b', fontWeight: 600 }}>Iniya (CS2023002)</span>
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>Present</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px' }}>
              <span style={{ color: '#1e293b', fontWeight: 600 }}>Tharun (CS2023003)</span>
              <span style={{ background: '#fef9c3', color: '#a16207', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>Late</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" style={{ display: 'flex', flexDirection: 'column', gap: '48px', marginTop: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', color: '#0f172a', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '12px' }}>Comprehensive Faculty Features</h2>
          <p style={{ fontSize: '0.95rem', color: '#475569' }}>Everything you need to automate registries, track records, and analyze classroom statistics.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <GlassCard 
                key={index} 
                className="light-card"
                hoverEffect 
                delay={index * 0.04} 
                style={{ 
                  padding: '30px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  borderRadius: '20px'
                }}
              >
                <div style={{
                  alignSelf: 'flex-start',
                  background: 'rgba(79, 70, 229, 0.06)',
                  color: '#4f46e5',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(79, 70, 229, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 750 }}>{feat.title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.55 }}>{feat.desc}</p>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* 4. Footer */}
      <footer 
        style={{
          padding: '32px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(79, 70, 229, 0.06)',
          borderRadius: '24px',
          marginTop: '20px'
        }}
      >
        <p style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>
          🎓 கற்க College Attendance Portal &copy; {new Date().getFullYear()}
        </p>
        <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
          Designed with clean Light Mode glassmorphism grids and resilient databases.
        </p>
      </footer>

    </div>
  );
};

export default Landing;
