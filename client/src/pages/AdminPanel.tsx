import React, { useState } from 'react';
import { gameApi } from '../services/api';
import { Question } from '../types';

const AdminPanel: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDaily, setIsDaily] = useState(false);
  const [date, setDate] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    type: 'multiple-choice',
    difficulty: 'medium',
    points: 15,
  });

  const handleAddQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.correctAnswer || !currentQuestion.category) {
      alert('Please fill in all required fields');
      return;
    }

    if (currentQuestion.type === 'multiple-choice' && (!currentQuestion.options || currentQuestion.options.length < 2)) {
      alert('Multiple choice questions need at least 2 options');
      return;
    }

    setQuestions([...questions, currentQuestion as Question]);
    setCurrentQuestion({
      type: 'multiple-choice',
      difficulty: 'medium',
      points: 15,
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmitGame = async (e: React.FormEvent) => {
    e.preventDefault();

    if (questions.length !== 10) {
      alert('A game must have exactly 10 questions');
      return;
    }

    try {
      await gameApi.createGame({
        title,
        description,
        questions,
        isDaily,
        date: date ? new Date(date) : undefined,
      });

      alert('Game created successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setIsDaily(false);
      setDate('');
      setQuestions([]);
    } catch (error: any) {
      alert(`Error creating game: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="admin-panel">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">⚙️ Admin Panel</h1>
          <p className="card-description">Create and manage music trivia games</p>
        </div>

        <form onSubmit={handleSubmitGame}>
          {/* Game Details */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Game Details</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Title *
              </label>
              <input
                type="text"
                className="text-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                className="text-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={isDaily}
                    onChange={(e) => setIsDaily(e.target.checked)}
                  />
                  <span style={{ fontWeight: 'bold' }}>Daily Game</span>
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Date
                </label>
                <input
                  type="date"
                  className="text-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>
              Questions ({questions.length}/10)
            </h2>

            {questions.map((q, index) => (
              <div
                key={index}
                style={{
                  padding: '1rem',
                  background: '#f8f9ff',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>Q{index + 1}:</strong> {q.question}
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                    {q.category} · {q.difficulty} · {q.points} pts
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleRemoveQuestion(index)}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Add Question Form */}
          {questions.length < 10 && (
            <div className="card" style={{ background: '#f8f9ff' }}>
              <h3 style={{ marginBottom: '1rem' }}>Add Question</h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Question Type *
                </label>
                <select
                  className="text-input"
                  value={currentQuestion.type}
                  onChange={(e) =>
                    setCurrentQuestion({ ...currentQuestion, type: e.target.value as any })
                  }
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="audio">Audio (Name That Tune)</option>
                  <option value="text-input">Text Input</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Question *
                </label>
                <input
                  type="text"
                  className="text-input"
                  value={currentQuestion.question || ''}
                  onChange={(e) =>
                    setCurrentQuestion({ ...currentQuestion, question: e.target.value })
                  }
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Correct Answer *
                </label>
                <input
                  type="text"
                  className="text-input"
                  value={currentQuestion.correctAnswer || ''}
                  onChange={(e) =>
                    setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })
                  }
                />
              </div>

              {currentQuestion.type === 'multiple-choice' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Options (comma-separated) *
                  </label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Option 1, Option 2, Option 3, Option 4"
                    value={currentQuestion.options?.join(', ') || ''}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        options: e.target.value.split(',').map((s) => s.trim()),
                      })
                    }
                  />
                </div>
              )}

              {currentQuestion.type === 'audio' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Audio URL
                  </label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="http://example.com/audio.mp3"
                    value={currentQuestion.audioUrl || ''}
                    onChange={(e) =>
                      setCurrentQuestion({ ...currentQuestion, audioUrl: e.target.value })
                    }
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Category *
                  </label>
                  <input
                    type="text"
                    className="text-input"
                    value={currentQuestion.category || ''}
                    onChange={(e) =>
                      setCurrentQuestion({ ...currentQuestion, category: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Difficulty *
                  </label>
                  <select
                    className="text-input"
                    value={currentQuestion.difficulty}
                    onChange={(e) => {
                      const difficulty = e.target.value as 'easy' | 'medium' | 'hard';
                      const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20;
                      setCurrentQuestion({ ...currentQuestion, difficulty, points });
                    }}
                  >
                    <option value="easy">Easy (10 pts)</option>
                    <option value="medium">Medium (15 pts)</option>
                    <option value="hard">Hard (20 pts)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Points
                  </label>
                  <input
                    type="number"
                    className="text-input"
                    value={currentQuestion.points || 10}
                    onChange={(e) =>
                      setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Hint (optional)
                </label>
                <input
                  type="text"
                  className="text-input"
                  value={currentQuestion.hint || ''}
                  onChange={(e) =>
                    setCurrentQuestion({ ...currentQuestion, hint: e.target.value })
                  }
                />
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddQuestion}
              >
                Add Question
              </button>
            </div>
          )}

          {/* Submit Button */}
          {questions.length === 10 && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" style={{ fontSize: '1.2rem' }}>
                Create Game
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
