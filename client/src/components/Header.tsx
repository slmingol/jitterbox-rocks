import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const Header: React.FC = () => {
  const { user, setUser } = useUser();
  const { theme, setTheme } = useTheme();
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [username, setUsername] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setUser({
        userId: username.toLowerCase().replace(/\s+/g, '-'),
        username: username.trim(),
      });
      setShowLogin(false);
      setUsername('');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setShowUserMenu(false);
  };

  const handleShowHelp = () => {
    localStorage.removeItem('howToPlayDismissed');
    setShowUserMenu(false);
    navigate('/');
    // Small delay to ensure navigation happens before reload
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const getThemeIcon = (themeName: 'light' | 'dark' | 'system') => {
    switch (themeName) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'system': return '💻';
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-top-row">
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '100%', flex: 1 }}>
            <img 
              src="/logo-cat-music-transparent.png" 
              alt="Jitterbox Rocks" 
              style={{ 
                height: '40px', 
                maxHeight: '50px',
                width: 'auto',
                maxWidth: '50px',
                objectFit: 'contain',
                flexShrink: 0
              }} 
            />
            <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Jitterbox Rocks</h1>
          </Link>
          
          <div className="user-info">
          {user ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span className="user-button-text">👤 {user.username}</span>
                <span style={{ fontSize: '0.7rem' }}>{showUserMenu ? '▲' : '▼'}</span>
              </button>
              
              {showUserMenu && (
                <div 
                  className="user-menu-dropdown"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    minWidth: '200px',
                    zIndex: 1000,
                    overflow: 'hidden',
                  }}
                >
                  {/* Theme Section */}
                  <div style={{ 
                    padding: '0.5rem 1rem', 
                    borderBottom: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)'
                  }}>
                    Theme
                  </div>
                  {(['light', 'dark', 'system'] as const).map((themeName) => (
                    <button
                      key={themeName}
                      onClick={() => handleThemeChange(themeName)}
                      className="user-menu-item"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        background: theme === themeName ? 'var(--bg-secondary)' : 'transparent',
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.95rem',
                      }}
                    >
                      <span>{getThemeIcon(themeName)}</span>
                      <span style={{ textTransform: 'capitalize' }}>{themeName}</span>
                      {theme === themeName && <span style={{ marginLeft: 'auto' }}>✓</span>}
                    </button>
                  ))}
                  
                  {/* Other Options */}
                  <div style={{ borderTop: '1px solid var(--border-color)' }}>
                    <button
                      onClick={handleShowHelp}
                      className="user-menu-item"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.95rem',
                      }}
                    >
                      <span>📖</span>
                      <span>Show Help</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="user-menu-item"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.95rem',
                      }}
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {showLogin ? (
                <form onSubmit={handleLogin} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="text-input"
                    style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                  />
                  <button type="submit" className="btn btn-primary">
                    Start
                  </button>
                </form>
              ) : (
                <button className="btn btn-primary" onClick={() => setShowLogin(true)}>
                  Login
                </button>
              )}
            </>
          )}
        </div>
        </div>
        
        <nav>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/daily"><span className="nav-full">Daily Game</span><span className="nav-short">Daily</span></Link></li>
            <li><Link to="/practice">Practice</Link></li>
            <li><Link to="/leaderboard"><span className="nav-full">Leaderboard</span><span className="nav-short">Board</span></Link></li>
            {user && <li><Link to="/stats"><span className="nav-full">My Stats</span><span className="nav-short">Stats</span></Link></li>}
            <li><Link to="/admin">Admin</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
