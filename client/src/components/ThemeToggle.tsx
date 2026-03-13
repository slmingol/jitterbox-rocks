import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return '💻';
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="theme-toggle"
      title={`Theme: ${getLabel()}`}
      style={{
        background: 'transparent',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '0.5rem 0.75rem',
        cursor: 'pointer',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-primary)',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--hover-bg)';
        e.currentTarget.style.borderColor = 'var(--primary-color)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <span>{getIcon()}</span>
      <span style={{ fontSize: '0.85rem' }}>{getLabel()}</span>
    </button>
  );
};

export default ThemeToggle;
