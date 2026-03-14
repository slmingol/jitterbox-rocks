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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pinnedCategories, setPinnedCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('pinnedCategories');
    return saved ? JSON.parse(saved) : [];
  });
  const [showPinnedOnly, setShowPinnedOnly] = useState<boolean>(() => {
    const saved = localStorage.getItem('showPinnedOnly');
    return saved ? JSON.parse(saved) : false;
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  // Save pinned categories to localStorage
  useEffect(() => {
    localStorage.setItem('pinnedCategories', JSON.stringify(pinnedCategories));
  }, [pinnedCategories]);

  // Save showPinnedOnly to localStorage
  useEffect(() => {
    localStorage.setItem('showPinnedOnly', JSON.stringify(showPinnedOnly));
  }, [showPinnedOnly]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && expandedCategory) {
        setExpandedCategory(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [expandedCategory]);

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

  // Filter categories by theme and search query
  const filteredCategories = useMemo(() => {
    const catMap = new Map<string, Game[]>();
    
    gamesByCategory.forEach((games, category) => {
      const filteredGames = games.filter(game => {
        // Filter by theme
        const matchesTheme = selectedTheme === 'all' || game.theme === selectedTheme;
        
        // Filter by search query
        const matchesSearch = searchQuery.trim() === '' || 
          game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (game.description && game.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesTheme && matchesSearch;
      });
      
      if (filteredGames.length > 0) {
        catMap.set(category, filteredGames);
      }
    });
    
    const sorted = Array.from(catMap.entries())
      .sort((a, b) => {
        // Sort pinned categories to the top
        const aIsPinned = pinnedCategories.includes(a[0]);
        const bIsPinned = pinnedCategories.includes(b[0]);
        if (aIsPinned && !bIsPinned) return -1;
        if (!aIsPinned && bIsPinned) return 1;
        return a[0].localeCompare(b[0]);
      });
    
    // Filter by pinned categories only if toggle is on
    if (showPinnedOnly && pinnedCategories.length > 0) {
      return sorted.filter(([category]) => pinnedCategories.includes(category));
    }
    
    return sorted;
  }, [gamesByCategory, selectedTheme, searchQuery, pinnedCategories, showPinnedOnly]);

  const handleRandomGame = async () => {
    try {
      // If there are pinned categories, select games where 100% of questions match
      if (pinnedCategories.length > 0) {
        const gamesFromPinned: Game[] = [];
        
        // Collect all games that have at least one question from pinned categories
        pinnedCategories.forEach(category => {
          const categoryGames = gamesByCategory.get(category);
          if (categoryGames) {
            categoryGames.forEach(game => {
              // Avoid duplicates (a game can be in multiple categories)
              if (!gamesFromPinned.find(g => g.gameId === game.gameId)) {
                gamesFromPinned.push(game);
              }
            });
          }
        });
        
        // STRICT FILTER: Only games where 100% of questions are from pinned categories
        const strictGames = gamesFromPinned.filter(game => {
          return game.questions.every(q => 
            q.category && pinnedCategories.includes(q.category)
          );
        });
        
        if (strictGames.length > 0) {
          const randomIndex = Math.floor(Math.random() * strictGames.length);
          const randomGame = strictGames[randomIndex];
          navigate(`/game/${randomGame.gameId}`);
        } else {
          // No games found with 100% questions from pinned categories
          alert(`No games found where ALL questions are from your pinned categories.\n\nPinned: ${pinnedCategories.join(', ')}\n\nGenerating strict decade games is recommended.`);
        }
        return;
      }
      
      // No pinned categories: use API to get random game from all games
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
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        {/* Title */}
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ margin: 0, marginBottom: '0.25rem', color: 'var(--primary-color)', fontSize: '1.5rem' }}>🎸 Practice Mode</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {pinnedCategories.length > 0 ? (
              <span>
                📌 {pinnedCategories.length} {pinnedCategories.length === 1 ? 'category' : 'categories'} pinned • Click any 📌 to toggle
                {showPinnedOnly && (
                  <span>
                    {' • '}
                    {filteredCategories.reduce((total, [, games]) => total + games.length, 0)} {filteredCategories.reduce((total, [, games]) => total + games.length, 0) === 1 ? 'game' : 'games'}
                  </span>
                )}
              </span>
            ) : (
              <span>
                {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} • Click 📌 on any category to pin it
                {searchQuery && ` • ${filteredCategories.reduce((total, [, games]) => total + games.length, 0)} ${filteredCategories.reduce((total, [, games]) => total + games.length, 0) === 1 ? 'game' : 'games'} found`}
              </span>
            )}
          </p>
        </div>

        {/* Controls Grid - 4 columns when pinned, 3 otherwise */}
        <div style={{ display: 'grid', gridTemplateColumns: pinnedCategories.length > 0 ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr', gap: '0.75rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                paddingRight: searchQuery ? '2.5rem' : '0.875rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '0.95rem',
                transition: 'border-color 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Era Filter */}
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            style={{
              padding: '0.625rem 0.875rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontSize: '0.95rem',
              cursor: 'pointer',
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
              width: '100%',
            }}
          >
            <option value="all">All Eras</option>
            {themes.map((theme) => (
              <option key={theme} value={theme}>
                {theme === 'mixed' ? 'Mixed' : theme}
              </option>
            ))}
          </select>

          {/* Show Pinned Toggle or Random Button */}
          {pinnedCategories.length > 0 ? (
            <button 
              className={showPinnedOnly ? "btn btn-primary" : "btn"}
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
              style={{ 
                padding: '0.625rem 1.25rem', 
                whiteSpace: 'nowrap', 
                fontSize: '0.95rem', 
                width: '100%',
                background: showPinnedOnly ? 'var(--primary-color)' : 'transparent',
                border: showPinnedOnly ? 'none' : '1px solid var(--border-color)',
                color: showPinnedOnly ? 'white' : 'var(--text-primary)',
              }}
            >
              {showPinnedOnly ? '📌 Pinned Only' : '👁️ Show All'}
            </button>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={handleRandomGame}
              style={{ padding: '0.625rem 1.25rem', whiteSpace: 'nowrap', fontSize: '0.95rem', width: '100%' }}
            >
              🎲 Random
            </button>
          )}

          {/* Random Button - always show when pinned */}
          {pinnedCategories.length > 0 && (
            <button 
              className="btn btn-primary" 
              onClick={handleRandomGame}
              style={{ padding: '0.625rem 1.25rem', whiteSpace: 'nowrap', fontSize: '0.95rem', width: '100%' }}
            >
              🎲 Random
            </button>
          )}
        </div>
      </div>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔍</div>
          <h2 style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>No games found</h2>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
            {searchQuery 
              ? `No games match "${searchQuery}"`
              : 'Try selecting a different era'
            }
          </p>
          <button 
            onClick={() => {
              setSelectedTheme('all');
              setSearchQuery('');
              setPinnedCategories([]);
              setShowPinnedOnly(false);
            }} 
            className="btn btn-primary"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', position: 'relative' }}>
          {filteredCategories.map(([category, games]) => {
            const isExpanded = expandedCategory === category;
            
            return (
              <div
                key={category}
                style={{
                  position: 'relative',
                  zIndex: isExpanded ? 10 : 1,
                }}
              >
                <div
                  className="card"
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: pinnedCategories.includes(category) ? '2px solid var(--primary-color)' : undefined,
                    boxShadow: pinnedCategories.includes(category) ? '0 2px 8px var(--primary-color-alpha)' : undefined,
                  }}
                  onClick={() => setExpandedCategory(isExpanded ? null : category)}
                >
                  {/* Category Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <span style={{ fontSize: '1.25rem' }}>{getCategoryIcon(category)}</span>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.05rem' }}>
                          {category}
                          {pinnedCategories.includes(category) && (
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}>📌</span>
                          )}
                        </h3>
                        <p style={{ margin: 0, marginTop: '0.15rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {games.length} {games.length === 1 ? 'game' : 'games'}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPinnedCategories(prev => 
                            prev.includes(category) 
                              ? prev.filter(c => c !== category)
                              : [...prev, category]
                          );
                        }}
                        style={{
                          background: pinnedCategories.includes(category) ? 'var(--primary-color)' : 'var(--bg-secondary)',
                          border: `2px solid ${pinnedCategories.includes(category) ? 'var(--primary-color)' : 'var(--border-color)'}`,
                          color: pinnedCategories.includes(category) ? 'white' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '1.1rem',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '6px',
                          transition: 'all 0.2s',
                          fontWeight: 600,
                          boxShadow: pinnedCategories.includes(category) ? '0 2px 4px rgba(102, 126, 234, 0.3)' : 'none',
                        }}
                        title={pinnedCategories.includes(category) ? 'Click to unpin this category' : 'Click to pin this category'}
                        onMouseEnter={(e) => {
                          if (!pinnedCategories.includes(category)) {
                            e.currentTarget.style.borderColor = 'var(--primary-color)';
                            e.currentTarget.style.color = 'var(--primary-color)';
                            e.currentTarget.style.background = 'var(--bg-hover)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          } else {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.5)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!pinnedCategories.includes(category)) {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.background = 'var(--bg-secondary)';
                            e.currentTarget.style.transform = 'scale(1)';
                          } else {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.3)';
                          }
                        }}
                      >
                        📌
                      </button>
                      
                      <span style={{ 
                        fontSize: '1.25rem', 
                        transition: 'transform 0.2s',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: 'var(--text-secondary)'
                      }}>
                        ▼
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Games List - Modal overlay */}
                {isExpanded && (
                  <>
                    {/* Backdrop */}
                    <div 
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 999,
                      }}
                      onClick={() => setExpandedCategory(null)}
                    />
                    
                    {/* Modal */}
                    <div 
                      className="card"
                      style={{ 
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        padding: 0,
                        width: 'calc(100vw - 2rem)',
                        maxWidth: '1200px',
                        maxHeight: '85vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 8px 24px var(--card-shadow)',
                        zIndex: 1000,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Modal Header */}
                      <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>{getCategoryIcon(category)}</span>
                          <div>
                            <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.25rem' }}>
                              {category}
                            </h3>
                            <p style={{ margin: 0, marginTop: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                              {games.length} {games.length === 1 ? 'game' : 'games'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedCategory(null)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          title="Close"
                        >
                          ✕
                        </button>
                      </div>
                      
                      {/* Scrollable Games Grid */}
                      <div style={{
                        padding: '1rem',
                        overflowY: 'auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.5rem',
                      }}>
                        {games.map((game) => (
                          <div
                            key={game.gameId}
                            onClick={() => navigate(`/game/${game.gameId}`)}
                            style={{
                              padding: '0.75rem',
                              background: 'var(--bg-secondary)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              flexDirection: 'column',
                              minHeight: '100px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--bg-hover)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--bg-secondary)';
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
                                {game.title}
                              </div>
                              {game.description && (
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', lineHeight: '1.3' }}>
                                  {game.description}
                                </div>
                              )}
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                {game.questions.length} questions
                                {game.theme && game.theme !== 'mixed' && (
                                  <span style={{ marginLeft: '0.5rem' }}>• {game.theme}</span>
                                )}
                              </div>
                            </div>
                            
                            <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                              <span style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>→</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
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
