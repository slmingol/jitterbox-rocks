import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { statsApi } from '../services/api';
import { DetailedUserStats } from '../types';
import { format } from 'date-fns';

const Statistics: React.FC = () => {
  const { user } = useUser();
  const [stats, setStats] = useState<DetailedUserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const data = await statsApi.getDetailedStats(user.userId);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="card">
        <h2>Please Login</h2>
        <p>You need to login to view your statistics.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card">
        <h2>No Statistics Available</h2>
        <p>Play some games to start tracking your progress!</p>
      </div>
    );
  }

  return (
    <div className="statistics-page">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">📊 Your Statistics</h1>
          <p className="card-description">Track your progress and performance</p>
        </div>

        {/* Overall Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Points</div>
            <div className="stat-value">{stats.totalPoints}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Games Played</div>
            <div className="stat-value">{stats.totalGamesPlayed}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Overall Accuracy</div>
            <div className="stat-value">{stats.overallAccuracy.toFixed(1)}%</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Global Rank</div>
            <div className="stat-value">#{stats.rank}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Current Streak</div>
            <div className="stat-value">{stats.currentStreak} 🔥</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Longest Streak</div>
            <div className="stat-value">{stats.longestStreak} 🏆</div>
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>Difficulty Breakdown</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Object.entries(stats.difficultyStats).map(([difficulty, data]) => (
            <div
              key={difficulty}
              style={{
                padding: '1rem',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span
                  className={`question-difficulty difficulty-${difficulty}`}
                  style={{ marginRight: '1rem' }}
                >
                  {difficulty}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {data.correct} / {data.attempted} correct
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {data.accuracy.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Type Stats */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>Question Type Performance</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Object.entries(stats.questionTypeStats).map(([type, data]) => (
            <div
              key={type}
              style={{
                padding: '1rem',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong style={{ textTransform: 'capitalize', marginRight: '1rem' }}>
                  {type.replace('-', ' ')}
                </strong>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {data.correct} / {data.attempted} correct
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {data.accuracy.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Performance */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>Category Performance</h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {Object.entries(stats.categoryStats)
            .sort((a, b) => b[1].accuracy - a[1].accuracy)
            .map(([category, data]) => (
              <div
                key={category}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>{category}</strong>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '1rem', fontSize: '0.9rem' }}>
                    ({data.correct}/{data.attempted})
                  </span>
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  {data.accuracy.toFixed(1)}%
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Games */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>Recent Games</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {stats.gameHistory.slice(-10).reverse().map((game, index) => {
            const accuracy = (game.correctAnswers / game.totalQuestions) * 100;
            const minutes = Math.floor(game.timeTaken / 60);
            const seconds = game.timeTaken % 60;

            return (
              <div
                key={index}
                style={{
                  padding: '1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto',
                  gap: '1rem',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {format(new Date(game.completedAt), 'MMM d, yyyy')}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {format(new Date(game.completedAt), 'h:mm a')}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{game.score}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>points</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: accuracy >= 70 ? '#22c55e' : '#ef4444' }}>
                    {accuracy.toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>accuracy</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {minutes}:{seconds.toString().padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>time</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
