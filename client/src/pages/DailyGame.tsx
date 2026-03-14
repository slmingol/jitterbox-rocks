import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameApi } from '../services/api';
import { Game } from '../types';
import { format } from 'date-fns';
import { useTheme } from '../context/ThemeContext';

const DailyGame: React.FC = () => {
  const [game, setGame] = useState<Game | null>(null);
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
    </div>
  );
};

export default DailyGame;
