import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { statsApi } from '../services/api';
import { UserStats } from '../types';

const Leaderboard: React.FC = () => {
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserRank();
    }
  }, [user]);

  const loadLeaderboard = async () => {
    try {
      const data = await statsApi.getLeaderboard(100);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRank = async () => {
    if (!user) return;

    try {
      const { rank } = await statsApi.getUserRank(user.userId);
      setUserRank(rank);
    } catch (error) {
      console.error('Error loading user rank:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  return (
    <div className="leaderboard-page">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">🏆 Leaderboard</h1>
          <p className="card-description">Top players by total points</p>
        </div>

        {user && userRank && (
          <div
            style={{
              background: '#667eea',
              color: 'white',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>#{userRank}</div>
            <div>Your Current Rank</div>
          </div>
        )}

        <ul className="leaderboard-list">
          {leaderboard.map((player, index) => {
            const rank = index + 1;
            const isCurrentUser = user && player.userId === user.userId;

            return (
              <li
                key={player.userId}
                className="leaderboard-item"
                style={{
                  background: isCurrentUser ? '#f8f9ff' : 'transparent',
                  border: isCurrentUser ? '2px solid #667eea' : 'none',
                  borderRadius: isCurrentUser ? '8px' : '0',
                  padding: '1rem',
                  fontWeight: isCurrentUser ? 'bold' : 'normal',
                }}
              >
                <span className="leaderboard-rank">
                  {getRankEmoji(rank)} {rank}
                </span>

                <div style={{ flex: 1 }}>
                  <div className="leaderboard-name">
                    {player.username || 'Anonymous Player'}
                    {isCurrentUser && (
                      <span
                        style={{
                          marginLeft: '0.5rem',
                          background: '#667eea',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                    {player.totalGamesPlayed} games · {player.currentStreak} day streak
                    {player.currentStreak > 0 && ' 🔥'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="leaderboard-score">{player.totalPoints}</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    {((player.totalCorrectAnswers / player.totalQuestionsAnswered) * 100 || 0).toFixed(1)}
                    % accuracy
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {leaderboard.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>No players yet. Be the first to play and top the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
