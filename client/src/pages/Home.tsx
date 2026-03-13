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

  return (
    <div className="home-page">
      {/* Welcome + How to Play - Dismissable */}
      {showHowToPlay && (
        <div className="card" style={{ marginBottom: '2rem', position: 'relative' }}>
          <button
            onClick={dismissHowToPlay}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: '0.25rem',
              lineHeight: 1,
            }}
            title="Dismiss"
          >
            ✕
          </button>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
              🎸 Welcome to Roadie Rumble!
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0' }}>
              Test your music knowledge with our comprehensive trivia game featuring daily challenges,
              practice mode, and detailed statistics tracking.
            </p>

            {!user && (
              <div style={{ 
                background: 'var(--warning-bg)', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginTop: '1.5rem',
                display: 'inline-block'
              }}>
                <p style={{ color: 'var(--warning-text)', fontWeight: 600, margin: 0 }}>
                  👆 Please login with a username to start playing and track your progress!
                </p>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-color)', fontSize: '1.3rem' }}>📖 How to Play</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem', fontSize: '1rem' }}>
                📝 Multiple Question Types
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Multiple choice, audio clips, or type-in answers
              </p>
            </div>
            
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem', fontSize: '1rem' }}>
                ⏰ No Time Limits
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Take your time - no pressure!
              </p>
            </div>
            
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem', fontSize: '1rem' }}>
                🏆 Earn Points
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Easy (10 pts), Medium (15 pts), Hard (20 pts)
              </p>
            </div>
            
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem', fontSize: '1rem' }}>
                🔥 Build Streaks
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
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
