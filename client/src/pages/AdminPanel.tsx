import React, { useState, useEffect } from 'react';

interface DecadeInfo {
  decade: string;
  categoryName: string;
  yearRange: string;
  availableSongs: number;
  existingGames: number;
  canGenerate: boolean;
}

interface Stats {
  totalGames: number;
  totalQuestions: number;
  gamesByDecade: Array<{ decade: string; count: number }>;
}

const AdminPanel: React.FC = () => {
  const [decades, setDecades] = useState<DecadeInfo[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [generateCount, setGenerateCount] = useState<Record<string, number>>({});
  const [importing, setImporting] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (
    process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'
  );

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [decadesRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/decades`),
        fetch(`${API_BASE_URL}/api/admin/stats`)
      ]);

      if (decadesRes.ok && statsRes.ok) {
        const decadesData = await decadesRes.json();
        const statsData = await statsRes.json();
        setDecades(decadesData);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (decade: string) => {
    const inputCount = generateCount[decade];
    const count = Math.min(Math.max(parseInt(String(inputCount)) || 10, 1), 100);
    setGenerating(decade);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decade, count })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        await loadData();
      } else {
        setMessage({ type: 'error', text: data.message || 'Generation failed' });
      }
    } catch (error) {
      console.error('Error generating games:', error);
      setMessage({ type: 'error', text: 'Failed to generate games' });
    } finally {
      setGenerating(null);
    }
  };

  const handleDelete = async (theme: string) => {
    if (!window.confirm(`Are you sure you want to delete all games for ${theme}? This cannot be undone.`)) {
      return;
    }

    setDeleting(theme);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/games/${theme}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        await loadData();
      } else {
        setMessage({ type: 'error', text: data.message || 'Delete failed' });
      }
    } catch (error) {
      console.error('Error deleting games:', error);
      setMessage({ type: 'error', text: 'Failed to delete games' });
    } finally {
      setDeleting(null);
    }
  };

  const handleCountChange = (decade: string, value: string) => {
    // Allow empty string or any number, we'll clamp on submit
    if (value === '') {
      setGenerateCount({ ...generateCount, [decade]: '' as any });
    } else {
      const num = parseInt(value);
      if (!isNaN(num)) {
        setGenerateCount({ ...generateCount, [decade]: num });
      }
    }
  };

  const handleExportDatabase = async () => {
    try {
      setMessage(null);
      const response = await fetch(`${API_BASE_URL}/api/admin/database/export`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jitterbox-rocks-${new Date().toISOString().split('T')[0]}.db`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Database exported successfully' });
    } catch (error) {
      console.error('Error exporting database:', error);
      setMessage({ type: 'error', text: 'Failed to export database' });
    }
  };

  const handleImportDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.db')) {
      setMessage({ type: 'error', text: 'Please select a .db file' });
      return;
    }

    if (!window.confirm('Importing a database will replace all current data. Continue?')) {
      return;
    }

    setImporting(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('database', file);

      const response = await fetch(`${API_BASE_URL}/api/admin/database/import`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `${data.message} (${data.games} games loaded)` });
        await loadData(); // Reload stats
      } else {
        setMessage({ type: 'error', text: data.message || 'Import failed' });
      }
    } catch (error) {
      console.error('Error importing database:', error);
      setMessage({ type: 'error', text: 'Failed to import database' });
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  if (loading && !stats) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: 'var(--text-primary)', fontWeight: '600' }}>
          Admin Panel
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Generate and manage music trivia games
        </p>
      </div>

      {message && (
        <div style={{
          padding: '0.875rem 1rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#16a34a' : '#dc2626',
          border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          {message.text}
        </div>
      )}

      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            padding: '1rem',
            background: 'var(--card-bg)',
            borderRadius: '10px',
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '0.25rem' }}>
              {stats.totalGames}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
              Total Games
            </div>
          </div>
          <div style={{
            padding: '1rem',
            background: 'var(--card-bg)',
            borderRadius: '10px',
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '0.25rem' }}>
              {stats.totalQuestions}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
              Total Questions
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: 'var(--card-bg)',
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: 'var(--card-shadow)',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--text-primary)', fontWeight: '600' }}>
            Database Management
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.813rem' }}>
            Export or import database files
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportDatabase}
            disabled={importing}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--primary-color)',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: importing ? 'not-allowed' : 'pointer',
              opacity: importing ? 0.5 : 1,
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              if (!importing) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            📥 Export Database
          </button>

          <label style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '6px',
            border: '1px solid var(--primary-color)',
            background: 'transparent',
            color: 'var(--primary-color)',
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: importing ? 'not-allowed' : 'pointer',
            opacity: importing ? 0.5 : 1,
            transition: 'all 0.15s',
            display: 'inline-block'
          }}
          onMouseEnter={(e) => {
            if (!importing) {
              e.currentTarget.style.background = 'var(--primary-color)';
              e.currentTarget.style.color = 'white';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--primary-color)';
          }}
          >
            {importing ? '⏳ Importing...' : '📤 Import Database'}
            <input
              type="file"
              accept=".db"
              onChange={handleImportDatabase}
              disabled={importing}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div style={{
        background: 'var(--card-bg)',
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: 'var(--card-shadow)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--text-primary)', fontWeight: '600' }}>
            Decade Games
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.813rem' }}>
            Strict filtering: all 10 questions from selected decade only
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '0.75rem'
        }}>
          {decades.map(decade => (
            <div key={decade.decade} style={{
              padding: '1rem',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              transition: 'all 0.2s',
              position: 'relative'
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '600', margin: 0 }}>
                    {decade.categoryName}
                  </h3>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--primary-color)',
                    fontWeight: '600',
                    background: 'rgba(var(--primary-rgb, 99, 102, 241), 0.1)',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '12px'
                  }}>
                    {decade.existingGames} games
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span>{decade.yearRange}</span>
                  <span>•</span>
                  <span>{decade.availableSongs} songs</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Qty:</span>
                  <input
                    type="number"
                    min="1"
                    value={generateCount[decade.decade] !== undefined ? generateCount[decade.decade] : 10}
                    onChange={(e) => handleCountChange(decade.decade, e.target.value)}
                    disabled={!decade.canGenerate || generating === decade.decade}
                    placeholder="1-100"
                    style={{
                      width: '60px',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}
                  />
                </div>

                <button
                  onClick={() => handleGenerate(decade.decade)}
                  disabled={!decade.canGenerate || generating !== null}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.875rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: decade.canGenerate && generating !== decade.decade ? 'var(--primary-color)' : '#6b7280',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.813rem',
                    cursor: decade.canGenerate && !generating ? 'pointer' : 'not-allowed',
                    opacity: generating === decade.decade ? 0.7 : 1,
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (decade.canGenerate && !generating) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {generating === decade.decade ? '⏳ Generating...' : '+ Generate'}
                </button>

                {decade.existingGames > 0 && (
                  <button
                    onClick={() => handleDelete(decade.decade)}
                    disabled={deleting !== null}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #ef4444',
                      background: 'transparent',
                      color: '#ef4444',
                      fontWeight: '600',
                      fontSize: '0.813rem',
                      cursor: deleting ? 'not-allowed' : 'pointer',
                      opacity: deleting === decade.decade ? 0.7 : 1,
                      transition: 'all 0.15s',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Delete all games"
                    onMouseEnter={(e) => {
                      if (!deleting) {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                  >
                    {deleting === decade.decade ? '⏳' : '🗑'}
                  </button>
                )}
              </div>

              {!decade.canGenerate && (
                <div style={{
                  marginTop: '0.5rem',
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  fontStyle: 'italic'
                }}>
                  ⚠️ Not enough songs (need 10+)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
