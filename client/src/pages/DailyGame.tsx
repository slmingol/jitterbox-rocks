import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameApi } from '../services/api';
import { Game } from '../types';
import { format } from 'date-fns';
import { useTheme } from '../context/ThemeContext';

const DailyGame: React.FC = () => {
  const [game, setGame] = useState<Game | null>(null);
  const [pastGames, setPastGames] = useState<Array<{date: string, game: Game | null}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';
  
  // Theme-aware colors
  const cardBg = isDark ? '#2a2a3e' : '#f8f9ff';
  const textSecondary = isDark ? '#b4b4c8' : '#666';

  useEffect(() => {
    loadDailyGame();
    loadPastGames();
  }, []);

  const loadDailyGame = async () => {
    try {
      setLoading(true);
      const dailyGame = await gameApi.getDailyGame();
      setGame(dailyGame);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load daily game');
    } finally {
      setLoading(false);
    }
  };

  const loadPastGames = async () => {
    try {
      const past = await gameApi.getPastDailyGames(7);
      setPastGames(past);
    } catch (err) {
      console.error('Failed to load past games:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading today's game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>Error</h2>
        <p style={{ color: '#dc3545' }}>{error}</p>
        <button className="btn btn-primary" onClick={loadDailyGame}>
          Try Again
        </button>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="card">
        <h2>No Daily Game Available</h2>
        <p>Check back later for today's challenge!</p>
      </div>
    );
  }

  return (
    <div className="daily-game-page">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">🎯 Daily Challenge</h1>
          <p style={{ color: textSecondary, fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
            {format(new Date(game.date), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#667eea', marginBottom: '0.5rem', fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)' }}>{game.title}</h2>
          <p style={{ color: textSecondary, fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>{game.description}</p>
        </div>

        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div style={{ background: cardBg, padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 'bold', color: '#667eea' }}>
              {game.questions.length}
            </div>
            <div style={{ color: textSecondary }}>Questions</div>
          </div>

          <div style={{ background: cardBg, padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 'bold', color: '#764ba2' }}>
              {game.questions.reduce((sum, q) => sum + q.points, 0)}
            </div>
            <div style={{ color: textSecondary }}>Total Points</div>
          </div>

          <div style={{ background: cardBg, padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 'bold', color: '#667eea' }}>
              ⏰
            </div>
            <div style={{ color: textSecondary }}>No Time Limit</div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            className="btn btn-primary"
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)' }}
            onClick={() => navigate(`/game/${game.gameId}`)}
          >
            Start Playing
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Question Breakdown</h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {game.questions.map((q, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: cardBg,
                borderRadius: '8px',
              }}
            >
              <span>
                <strong>Q{index + 1}:</strong> {q.category}
              </span>
              <span>
                <span
                  className={`question-difficulty difficulty-${q.difficulty}`}
                  style={{ marginRight: '0.5rem', padding: '0.25rem 0.75rem' }}
                >
                  {q.difficulty}
                </span>
                <strong>{q.points} pts</strong>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Past 7 Days */}
      {pastGames.length > 0 && (
        <div style={{ 
          marginTop: '2rem',
          padding: '1.5rem',
          background: isDark ? '#1a1a2e' : '#f0f0f5',
          borderRadius: '12px',
          opacity: 0.85
        }}>
          <h4 style={{ 
            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
            color: textSecondary,
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Previous Daily Challenges
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {pastGames.map(({ date, game: pastGame }) => (
              <div
                key={date}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '1rem',
                  background: cardBg,
                  borderRadius: '8px',
                  fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)',
                  opacity: 0.9,
                  textAlign: 'center'
                }}
              >
                <div style={{ color: textSecondary, fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {format(new Date(date), 'MMM d')}
                </div>
                {pastGame ? (
                  <>
                    <div style={{ marginBottom: '0.75rem', fontSize: 'clamp(0.9rem, 2.3vw, 1rem)' }}>
                      {pastGame.title}
                    </div>
                    <button
                      onClick={() => navigate(`/game/${pastGame.gameId}`)}
                      style={{
                        background: '#667eea',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '0.5rem 1rem',
                        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                        borderRadius: '6px',
                        width: '100%'
                      }}
                    >
                      Play
                    </button>
                  </>
                ) : (
                  <span style={{ color: textSecondary, fontStyle: 'italic' }}>No game available</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyGame;
