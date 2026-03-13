import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameApi } from '../services/api';
import { Game } from '../types';

const PracticeMode: React.FC = () => {
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gamesData, themesData] = await Promise.all([
        gameApi.getAllGames(1000),
        gameApi.getAllThemes()
      ]);
      setAllGames(gamesData);
      setThemes(themesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group games by category
  const gamesByCategory = useMemo(() => {
    const grouped = new Map<string, Game[]>();
    
    allGames.forEach(game => {
      // Get unique categories for this game
      const gameCategories = new Set<string>();
      game.questions.forEach(q => {
        if (q.category) gameCategories.add(q.category);
      });
      
      // Add game to each category
      gameCategories.forEach(cat => {
        if (!grouped.has(cat)) {
          grouped.set(cat, []);
        }
        grouped.get(cat)!.push(game);
      });
    });
    
    return grouped;
  }, [allGames]);

  // Filter categories by theme
  const filteredCategories = useMemo(() => {
    const catMap = new Map<string, Game[]>();
    
    gamesByCategory.forEach((games, category) => {
      const filteredGames = games.filter(game => 
        selectedTheme === 'all' || game.theme === selectedTheme
      );
      
      if (filteredGames.length > 0) {
        catMap.set(category, filteredGames);
      }
    });
    
    return Array.from(catMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [gamesByCategory, selectedTheme]);

  const handleRandomGame = async () => {
    try {
      const randomGame = await gameApi.getRandomGame();
      navigate(`/game/${randomGame.gameId}`);
    } catch (error) {
      console.error('Error loading random game:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('history')) return '📚';
    if (category.toLowerCase().includes('chart')) return '📊';
    if (category.toLowerCase().includes('hits')) return '⭐';
    if (category.toLowerCase().includes('decade')) return '🗓️';
    if (category.toLowerCase().includes('billboard')) return '🎵';
    return '🎸';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading games...</p>
      </div>
    );
  }

  return (
    <div className="practice-mode">
      {/* Header */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, marginBottom: '0.5rem', color: 'var(--primary-color)' }}>🎸 Practice Mode</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Era Filter */}
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '1rem',
                cursor: 'pointer',
                background: 'var(--card-bg)',
                color: 'var(--text-primary)',
                minWidth: '150px',
              }}
            >
              <option value="all">All Eras</option>
              {themes.map((theme) => (
                <option key={theme} value={theme}>
                  {theme === 'mixed' ? 'Mixed' : theme}
                </option>
              ))}
            </select>

            <button 
              className="btn btn-primary" 
              onClick={handleRandomGame}
              style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
            >
              🎲 Random
            </button>
          </div>
        </div>
      </div>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
          <h2 style={{ color: 'var(--text-secondary)' }}>No games found</h2>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
            Try selecting a different era
          </p>
          <button onClick={() => setSelectedTheme('all')} className="btn btn-primary">
            Show all eras
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredCategories.map(([category, games]) => {
            const isExpanded = expandedCategory === category;
            
            return (
              <div
                key={category}
                className="card"
                style={{
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
              >
                {/* Category Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getCategoryIcon(category)}</span>
                    <div>
                      <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.2rem' }}>
                        {category}
                      </h3>
                      <p style={{ margin: 0, marginTop: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {games.length} {games.length === 1 ? 'game' : 'games'}
                      </p>
                    </div>
                  </div>
                  
                  <span style={{ 
                    fontSize: '1.5rem', 
                    transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    color: 'var(--text-secondary)'
                  }}>
                    ▼
                  </span>
                </div>

                {/* Expanded Games List */}
                {isExpanded && (
                  <div 
                    style={{ 
                      marginTop: '1.5rem', 
                      paddingTop: '1.5rem', 
                      borderTop: '1px solid var(--border-color)',
                      display: 'grid',
                      gap: '0.75rem'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {games.map((game) => (
                      <div
                        key={game.gameId}
                        onClick={() => navigate(`/game/${game.gameId}`)}
                        style={{
                          padding: '1rem',
                          background: 'var(--bg-secondary)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bg-hover)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            {game.title}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                            {game.questions.length} questions
                            {game.theme && game.theme !== 'mixed' && (
                              <span style={{ marginLeft: '0.75rem' }}>• {game.theme}</span>
                            )}
                          </div>
                        </div>
                        
                        <span style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}>→</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PracticeMode;
