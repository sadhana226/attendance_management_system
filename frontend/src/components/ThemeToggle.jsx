import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('attendIQ_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('attendIQ_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="glass-button"
      style={{ 
        padding: '8px 12px', 
        borderRadius: '10px', 
        border: '1px solid var(--glass-border)',
        minWidth: '42px',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Sun size={18} style={{ color: '#fbbf24' }} />
      ) : (
        <Moon size={18} style={{ color: '#4f46e5' }} />
      )}
    </button>
  );
};

export default ThemeToggle;
