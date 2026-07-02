import React from 'react';
import GlassCard from './GlassCard';

const StatsCard = ({ title, value, icon: Icon, description, trend, delay = 0, accentColor = 'var(--accent-primary)' }) => {
  return (
    <GlassCard 
      hoverEffect 
      delay={delay} 
      style={{ 
        position: 'relative', 
        overflow: 'hidden',
        padding: '24px'
      }}
    >
      {/* Dynamic decorative backdrop blur glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: accentColor,
          filter: 'blur(35px)',
          opacity: 0.2,
          pointerEvents: 'none'
        }}
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 550 }}>{title}</span>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '10px',
          borderRadius: '10px',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accentColor
        }}>
          <Icon size={20} />
        </div>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
          {value}
        </h2>
      </div>
      
      {description && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {trend && (
            <span style={{ color: trend.type === 'positive' ? 'var(--status-present)' : 'var(--status-absent)', fontWeight: 650 }}>
              {trend.value}
            </span>
          )}
          <span>{description}</span>
        </div>
      )}
    </GlassCard>
  );
};

export default StatsCard;
