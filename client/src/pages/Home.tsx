import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface SystemStats {
  totalGames: number;
  dailyGames: number;
  practiceGames: number;
  totalQuestions: number;
  totalSongs: number;
  totalPlayers: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  globalAccuracy: string;
  averageQuestionsPerGame: string;
}

const Home: React.FC = () => {
  const { user } = useUser();
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(() => {
    const dismissed = localStorage.getItem('howToPlayDismissed');
    return dismissed !== 'true';
  });

  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        const response = await fetch(`${API_URL}/stats/system/overview`);
        if (response.ok) {
          const data = await response.json();
          setSystemStats(data);
        }
      } catch (error) {
        console.error('Error fetching system stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemStats();
  }, []);

  const dismissHowToPlay = () => {
    setShowHowToPlay(false);
    localStorage.setItem('howToPlayDismissed', 'true');
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showHowToPlay) {
        dismissHowToPlay();
      }
    };

    if (showHowToPlay) {
      window.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showHowToPlay]);

  return (
    <div className="home-page">
      {/* Welcome + How to Play - Combined Dismissable Section */}
      {showHowToPlay && (
        <div className="card" style={{ marginBottom: '2rem', padding: '2.7rem 1.8rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--bg-secondary) 100%)', position: 'relative' }}>
          <button
            onClick={dismissHowToPlay}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'transparent',
              border: 'none',
              fontSize: '1.35rem',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: '0.25rem',
              lineHeight: 1,
            }}
            title="Dismiss"
          >
            ✕
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.8rem' }}>
            <img 
              src="/logo.png" 
              alt="Jitterbox Rocks" 
              style={{ 
                width: '100%',
                maxWidth: '720px',
                height: 'auto',
                objectFit: 'contain'
              }} 
            />
          </div>
          
          <h1 style={{ fontSize: '2.7rem', marginBottom: '0.9rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
            Welcome to Jitterbox Rocks!
          </h1>
          
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '1.8rem', maxWidth: '630px', margin: '0 auto 1.8rem auto' }}>
            Test your music knowledge with our comprehensive trivia game featuring daily challenges,
            practice mode, and detailed statistics tracking.
          </p>

          {!user && (
            <div style={{ 
              background: 'var(--warning-bg)', 
              padding: '1.125rem', 
              borderRadius: '8px', 
              marginBottom: '1.8rem',
              display: 'inline-block',
              maxWidth: '540px'
            }}>
              <p style={{ color: 'var(--warning-text)', fontWeight: 600, margin: 0, fontSize: '1rem' }}>
                👆 Please login with a username to start playing and track your progress!
              </p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.8rem' }}>
            <h2 style={{ marginBottom: '1.35rem', color: 'var(--primary-color)', fontSize: '1.35rem' }}>📖 How to Play</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(216px, 1fr))', gap: '0.9rem', marginTop: '1.35rem' }}>
            <div style={{ padding: '0.9rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.45rem', fontSize: '0.9rem' }}>
                📝 Multiple Question Types
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.81rem', margin: 0 }}>
                Multiple choice, audio clips, or type-in answers
              </p>
            </div>
            
            <div style={{ padding: '0.9rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.45rem', fontSize: '0.9rem' }}>
                ⏰ No Time Limits
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.81rem', margin: 0 }}>
                Take your time - no pressure!
              </p>
            </div>
            
            <div style={{ padding: '0.9rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.45rem', fontSize: '0.9rem' }}>
                🏆 Earn Points
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.81rem', margin: 0 }}>
                Easy (10 pts), Medium (15 pts), Hard (20 pts)
              </p>
            </div>
            
            <div style={{ padding: '0.9rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.45rem', fontSize: '0.9rem' }}>
                🔥 Build Streaks
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.81rem', margin: 0 }}>
                Play daily to compete on the leaderboard
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="home-grid">
        {/* Game Mode Cards */}
        <div className="stats-grid">
          <div className="card" style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>🎯 Daily Challenge</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Play today's unique 10-question game and compete with others on the leaderboard.
            </p>
            <Link to="/daily" className="btn btn-primary">
              Play Daily Game
            </Link>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>🎸 Practice Mode</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Access all previous games and improve your music knowledge at your own pace.
            </p>
            <Link to="/practice" className="btn btn-secondary">
              Practice Now
            </Link>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>📊 Statistics</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Track your performance, streaks, and see detailed analytics of your gameplay.
            </p>
            <Link to="/stats" className="btn btn-outline">
              View Stats
            </Link>
          </div>
        </div>

        {/* System Stats - Compact Sidebar */}
        {!loading && systemStats && (
          <div className="card" style={{ 
            minWidth: '200px',
            maxWidth: '250px',
            padding: '1.5rem',
          }}>
            <h3 style={{ 
              fontSize: '1rem', 
              marginBottom: '1rem', 
              color: 'var(--text-primary)',
              fontWeight: '600'
            }}>
              📊 Stats
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  {systemStats.totalGames.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Games</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  {systemStats.totalSongs.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Songs</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  {systemStats.totalPlayers.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Players</div>
              </div>
              {systemStats.totalQuestionsAnswered > 0 && (
                <div style={{ 
                  paddingTop: '0.75rem', 
                  borderTop: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                    {systemStats.globalAccuracy}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Accuracy</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
