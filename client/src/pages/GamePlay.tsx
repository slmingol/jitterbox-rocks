import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { gameApi, statsApi } from '../services/api';
import { Game, Question } from '../types';

const GamePlay: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const textInputRef = useRef<HTMLInputElement>(null);

  const [game, setGame] = useState<Game | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [gameStartTime] = useState(Date.now());
  const [gameCompleted, setGameCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Refs for keyboard handler to access current state without re-creating the listener
  const stateRef = useRef({
    game,
    user,
    currentQuestionIndex,
    selectedOption,
    showResult,
    userAnswer,
    suggestions,
    showSuggestions,
    selectedSuggestionIndex,
    score,
    correctAnswers,
    questionStartTime
  });

  // Refs for handler functions
  const handlersRef = useRef({
    handleSubmitAnswer: () => {},
    handleSkipQuestion: () => {},
    handleNextQuestion: () => {}
  });

  // Keep stateRef in sync with current state
  useEffect(() => {
    stateRef.current = {
      game,
      user,
      currentQuestionIndex,
      selectedOption,
      showResult,
      userAnswer,
      suggestions,
      showSuggestions,
      selectedSuggestionIndex,
      score,
      correctAnswers,
      questionStartTime
    };
  }, [game, user, currentQuestionIndex, selectedOption, showResult, userAnswer, suggestions, showSuggestions, selectedSuggestionIndex, score, correctAnswers, questionStartTime]);

  useEffect(() => {
    if (gameId) {
      loadGame();
    }
  }, [gameId]);

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setUserAnswer('');
    setSelectedOption(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    
    // Auto-focus text input when question changes
    if (textInputRef.current && game) {
      const currentQuestion = game.questions[currentQuestionIndex];
      if (currentQuestion.type === 'text-input' || currentQuestion.type === 'audio') {
        setTimeout(() => textInputRef.current?.focus(), 100);
      }
    }
  }, [currentQuestionIndex, game]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const { game, user, currentQuestionIndex, selectedOption, showResult, userAnswer, suggestions, showSuggestions, selectedSuggestionIndex } = stateRef.current;
      
      if (!game || !user) return;

      const currentQuestion = game.questions[currentQuestionIndex];

      // Handle autocomplete navigation with arrow keys
      if (showSuggestions && suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          return;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          return;
        } else if (e.key === 'Tab' || e.key === 'Enter') {
          e.preventDefault();
          if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
            setUserAnswer(suggestions[selectedSuggestionIndex]);
            setShowSuggestions(false);
            setSelectedSuggestionIndex(-1);
            textInputRef.current?.focus();
          } else if (suggestions.length > 0) {
            // If no item is selected but there are suggestions, select the first one
            setUserAnswer(suggestions[0]);
            setShowSuggestions(false);
            setSelectedSuggestionIndex(-1);
            textInputRef.current?.focus();
          }
          return;
        }
      }

      // Prevent keyboard shortcuts when typing in text input (except Enter, Escape, and S)
      if (
        (currentQuestion.type === 'text-input' || currentQuestion.type === 'audio') &&
        !showResult &&
        e.key !== 'Enter' &&
        e.key !== 'Escape' &&
        e.key.toLowerCase() !== 's' &&
        e.key !== 'Tab'
      ) {
        return;
      }

      // "I Don't Know" key: Skip question (Escape or S key)
      if ((e.key === 'Escape' || e.key.toLowerCase() === 's') && !showResult) {
        e.preventDefault();
        handlersRef.current.handleSkipQuestion();
        return;
      }

      // Enter key: Submit answer or go to next question
      if (e.key === 'Enter') {
        e.preventDefault();
        if (showResult) {
          handlersRef.current.handleNextQuestion();
        } else {
          handlersRef.current.handleSubmitAnswer();
        }
        return;
      }

      // Multiple choice keyboard shortcuts
      if (currentQuestion.type === 'multiple-choice' && !showResult) {
        const options = currentQuestion.options || [];

        // Number keys (1-9) to select options
        const num = parseInt(e.key);
        if (num >= 1 && num <= options.length) {
          setSelectedOption(options[num - 1]);
          return;
        }

        // Arrow keys for navigation
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const currentIndex = selectedOption ? options.indexOf(selectedOption) : -1;
          let newIndex;

          if (e.key === 'ArrowDown') {
            newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
          } else {
            newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
          }

          setSelectedOption(options[newIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []); // Empty deps - using stateRef to access current values

  // Fetch autocomplete suggestions
  const fetchAutocompleteSuggestions = async (query: string, questionText: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/games/autocomplete?query=${encodeURIComponent(query)}&question=${encodeURIComponent(questionText)}`
      );
      const data = await response.json();
      setSuggestions(Array.isArray(data) ? data : []);
      setShowSuggestions(data.length > 0);
      setSelectedSuggestionIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Handle text input change with autocomplete
  const handleTextInputChange = (value: string, questionText: string) => {
    setUserAnswer(value);
    if (value.length >= 2) {
      fetchAutocompleteSuggestions(value, questionText);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Select a suggestion
  const selectSuggestion = (suggestion: string) => {
    setUserAnswer(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    textInputRef.current?.focus();
  };

  const loadGame = async () => {
    try {
      const gameData = await gameApi.getGame(gameId!);
      setGame(gameData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading game:', error);
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!game || !user) return;

    const currentQuestion = game.questions[currentQuestionIndex];
    const answer = currentQuestion.type === 'multiple-choice' ? selectedOption || '' : userAnswer;

    if (!answer) {
      alert('Please provide an answer');
      return;
    }

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    try {
      const result = await statsApi.recordQuestion({
        userId: user.userId,
        username: user.username,
        gameId: game.gameId,
        questionIndex: currentQuestionIndex,
        userAnswer: answer,
        timeSpent,
      });

      setIsCorrect(result.isCorrect);
      setShowResult(true);

      if (result.isCorrect) {
        setScore(score + result.points);
        setCorrectAnswers(correctAnswers + 1);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleSkipQuestion = async () => {
    if (!game || !user) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    try {
      // Record as an incorrect answer
      await statsApi.recordQuestion({
        userId: user.userId,
        username: user.username,
        gameId: game.gameId,
        questionIndex: currentQuestionIndex,
        userAnswer: '',
        timeSpent,
      });

      // Show the result with the correct answer
      setIsCorrect(false);
      setShowResult(true);
    } catch (error) {
      console.error('Error skipping question:', error);
    }
  };

  const handleNextQuestion = () => {
    if (!game) return;

    setShowResult(false);
    setUserAnswer('');
    setSelectedOption(null);
    
    if (currentQuestionIndex < game.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeGame();
    }
  };

  // Update handler refs for keyboard shortcuts
  useEffect(() => {
    handlersRef.current = {
      handleSubmitAnswer,
      handleSkipQuestion,
      handleNextQuestion
    };
  }, [handleSubmitAnswer, handleSkipQuestion, handleNextQuestion]);

  const completeGame = async () => {
    if (!game || !user) return;

    const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);

    try {
      await statsApi.completeGame({
        userId: user.userId,
        username: user.username,
        gameId: game.gameId,
        score,
        totalQuestions: game.questions.length,
        correctAnswers,
        timeTaken,
      });

      setGameCompleted(true);
    } catch (error) {
      console.error('Error completing game:', error);
      setGameCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading game...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="card">
        <h2>Game Not Found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/practice')}>
          Browse Games
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card">
        <h2>Please Login</h2>
        <p>You need to login to play the game and track your progress.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go to Home
        </button>
      </div>
    );
  }

  if (gameCompleted) {
    const accuracy = (correctAnswers / game.questions.length) * 100;
    const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    return (
      <div className="card">
        <div className="score-display">
          <h1 style={{ color: '#667eea', marginBottom: '1rem', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>🎉 Game Complete!</h1>
          
          <div className="score-value">{score}</div>
          <div className="score-label">Total Points</div>

          <div className="stats-grid" style={{ marginTop: '2rem', textAlign: 'left' }}>
            <div className="stat-card">
              <div className="stat-label">Correct Answers</div>
              <div className="stat-value">{correctAnswers}/{game.questions.length}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Accuracy</div>
              <div className="stat-value">{accuracy.toFixed(1)}%</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Time Taken</div>
              <div className="stat-value">{minutes}:{seconds.toString().padStart(2, '0')}</div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/stats')}>
              View Stats
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/practice')}>
              Play Another
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/')}>
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion: Question = game.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / game.questions.length) * 100;

  // Get all unique categories from the game
  const gameCategories = Array.from(new Set(game.questions.map(q => q.category)));
  
  // Get pinned categories from localStorage
  const pinnedCategories = (() => {
    try {
      const saved = localStorage.getItem('pinnedCategories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="game-play">
      <div className="card">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="question-container">
          <div className="question-header">
            <span className="question-number">
              Question {currentQuestionIndex + 1} of {game.questions.length}
            </span>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span className={`question-difficulty difficulty-${currentQuestion.difficulty}`}>
                {currentQuestion.difficulty}
              </span>
              <span style={{ fontWeight: 'bold', color: '#667eea' }}>
                {currentQuestion.points} pts
              </span>
            </div>
          </div>

          <div className="question-category" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Categories:</span>
            {gameCategories.map(category => (
              <span 
                key={category}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: pinnedCategories.includes(category) ? 'var(--primary-color)' : 'var(--bg-secondary)',
                  color: pinnedCategories.includes(category) ? 'white' : 'var(--text-primary)',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                {pinnedCategories.includes(category) && '📌 '}
                {category}
              </span>
            ))}
          </div>

          <h2 className="question-text">{currentQuestion.question}</h2>

          {currentQuestion.hint && !showResult && (
            <div style={{ background: '#fff3cd', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <strong>💡 Hint:</strong> {currentQuestion.hint}
            </div>
          )}

          {/* Multiple Choice */}
          {currentQuestion.type === 'multiple-choice' && (
            <>
              {!showResult && (
                <div style={{ 
                  background: '#f0f4ff', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                  color: '#666',
                  wordWrap: 'break-word'
                }}>
                  ⌨️ <strong>Shortcuts:</strong> Press 1-{currentQuestion.options?.length || 0} to select, ↑↓ arrows, <kbd style={{ 
                    padding: '0.1rem 0.3rem', 
                    background: '#fff', 
                    border: '1px solid #ccc', 
                    borderRadius: '3px',
                    fontFamily: 'monospace',
                    fontSize: '0.85em'
                  }}>Enter</kbd> = submit, <kbd style={{ 
                    padding: '0.1rem 0.3rem', 
                    background: '#fff', 
                    border: '1px solid #ccc', 
                    borderRadius: '3px',
                    fontFamily: 'monospace',
                    fontSize: '0.85em'
                  }}>Esc</kbd>/<kbd style={{ 
                    padding: '0.1rem 0.3rem', 
                    background: '#fff', 
                    border: '1px solid #ccc', 
                    borderRadius: '3px',
                    fontFamily: 'monospace',
                    fontSize: '0.85em'
                  }}>S</kbd> = skip
                </div>
              )}
              <div className="options-container">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    className={`option-button ${
                      showResult
                        ? option === currentQuestion.correctAnswer
                          ? 'correct'
                          : option === selectedOption
                          ? 'incorrect'
                          : ''
                        : selectedOption === option
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => !showResult && setSelectedOption(option)}
                    disabled={showResult}
                  >
                    <span style={{ 
                      display: 'inline-block', 
                      minWidth: '1.5rem', 
                      fontWeight: 'bold',
                      color: showResult 
                        ? 'inherit'
                        : selectedOption === option 
                        ? 'inherit' 
                        : '#999'
                    }}>
                      {index + 1}.
                    </span>{' '}
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Audio Question */}
          {currentQuestion.type === 'audio' && (
            <>
              <div className="audio-player">
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                  🎵 Listen to the audio clip and answer below
                </p>
                {currentQuestion.audioUrl ? (
                  <audio controls style={{ width: '100%' }}>
                    <source src={currentQuestion.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <p style={{ color: '#dc3545' }}>Audio file not available (demo mode)</p>
                )}
              </div>
              {!showResult && (
                <div style={{ 
                  background: '#f0f4ff', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  marginTop: '1rem',
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                  color: '#666',
                  wordWrap: 'break-word'
                }}>
                  ⌨️ <strong>Shortcuts:</strong> <kbd style={{ 
                    padding: '0.1rem 0.3rem', 
                    background: '#fff', 
                    border: '1px solid #ccc', 
                    borderRadius: '3px',
                    fontFamily: 'monospace',
                    fontSize: '0.85em'
                  }}>Enter</kbd> = submit, <kbd style={{ 
                    padding: '0.1rem 0.3rem', 
                    background: '#fff', 
                    border: '1px solid #ccc', 
                    borderRadius: '3px',
                    fontFamily: 'monospace',
                    fontSize: '0.85em'
                  }}>Esc</kbd>/<kbd style={{ 
                    padding: '0.1rem 0.3rem', 
                    background: '#fff', 
                    border: '1px solid #ccc', 
                    borderRadius: '3px',
                    fontFamily: 'monospace',
                    fontSize: '0.85em'
                  }}>S</kbd> = skip
                </div>
              )}
              <div style={{ position: 'relative' }}>
                <input
                  ref={textInputRef}
                  type="text"
                  className="text-input"
                  placeholder="Type your answer here..."
                  value={userAnswer}
                  onChange={(e) => handleTextInputChange(e.target.value, currentQuestion.question)}
                  onFocus={() => {
                    if (userAnswer.length >= 2) {
                      setShowSuggestions(suggestions.length > 0);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow click
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  disabled={showResult}
                  style={{ marginTop: '1rem', width: '100%' }}
                  autoComplete="off"
                />
                
                {/* Autocomplete Dropdown */}
                {showSuggestions && !showResult && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '2px solid #667eea',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    {loadingSuggestions && (
                      <div style={{ padding: '0.75rem', color: '#666', fontSize: '0.9rem' }}>
                        Loading suggestions...
                      </div>
                    )}
                    {!loadingSuggestions && suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectSuggestion(suggestion);
                        }}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          background: selectedSuggestionIndex === index ? '#f0f4ff' : 'white',
                          borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none',
                          transition: 'background 0.15s'
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                    <div style={{
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#999',
                      borderTop: '1px solid #eee',
                      background: '#f9f9f9',
                      textAlign: 'center'
                    }}>
                      ↑↓ Navigate • Enter/Tab to select • Esc to close
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Text Input */}
          {currentQuestion.type === 'text-input' && (
            <>
              {!showResult && (
                <div style={{ 
                  background: '#f0f4ff', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                  color: '#666',
                  wordWrap: 'break-word'
                }}>
                  ⌨️ <strong>Shortcuts:</strong> <kbd style={{ 
                    padding: '0.1rem 0.3rem', 
                    background: '#fff', 
                    border: '1px solid #ccc', 
                    borderRadius: '3px',
                    fontFamily: 'monospace',
                    fontSize: '0.85em'
                  }}>Enter</kbd> = submit, <kbd style={{ 
                    padding: '0.1rem 0.3rem', 
                    background: '#fff', 
                    border: '1px solid #ccc', 
                    borderRadius: '3px',
                    fontFamily: 'monospace',
                    fontSize: '0.85em'
                  }}>Esc</kbd>/<kbd style={{ 
                    padding: '0.1rem 0.3rem', 
                    background: '#fff', 
                    border: '1px solid #ccc', 
                    borderRadius: '3px',
                    fontFamily: 'monospace',
                    fontSize: '0.85em'
                  }}>S</kbd> = skip
                </div>
              )}
              <div style={{ position: 'relative' }}>
                <input
                  ref={textInputRef}
                  type="text"
                  className="text-input"
                  placeholder="Type your answer here..."
                  value={userAnswer}
                  onChange={(e) => handleTextInputChange(e.target.value, currentQuestion.question)}
                  onFocus={() => {
                    if (userAnswer.length >= 2) {
                      setShowSuggestions(suggestions.length > 0);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow click
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  disabled={showResult}
                  style={{ width: '100%' }}
                  autoComplete="off"
                />
                
                {/* Autocomplete Dropdown */}
                {showSuggestions && !showResult && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '2px solid #667eea',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    {loadingSuggestions && (
                      <div style={{ padding: '0.75rem', color: '#666', fontSize: '0.9rem' }}>
                        Loading suggestions...
                      </div>
                    )}
                    {!loadingSuggestions && suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectSuggestion(suggestion);
                        }}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          background: selectedSuggestionIndex === index ? '#f0f4ff' : 'white',
                          borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none',
                          transition: 'background 0.15s'
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                    <div style={{
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#999',
                      borderTop: '1px solid #eee',
                      background: '#f9f9f9',
                      textAlign: 'center'
                    }}>
                      ↑↓ Navigate • Enter/Tab to select • Esc to close
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Result Display */}
          {showResult && (
            <div
              style={{
                marginTop: '2rem',
                padding: '1.5rem',
                borderRadius: '8px',
                background: isCorrect ? '#d4edda' : '#f8d7da',
                border: `2px solid ${isCorrect ? '#28a745' : '#dc3545'}`,
              }}
            >
              <h3 style={{ color: isCorrect ? '#155724' : '#721c24', marginBottom: '0.5rem' }}>
                {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
              </h3>
              {!isCorrect && (
                <p style={{ color: '#721c24' }}>
                  The correct answer was: <strong>{currentQuestion.correctAnswer}</strong>
                </p>
              )}
              {isCorrect && (
                <p style={{ color: '#155724' }}>
                  You earned <strong>{currentQuestion.points} points</strong>!
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            {!showResult ? (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={handleSubmitAnswer}>
                  Submit Answer
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleSkipQuestion}
                  style={{ background: '#6c757d' }}
                >
                  I Don't Know
                </button>
              </div>
            ) : (
              <>
                <button className="btn btn-primary" onClick={handleNextQuestion}>
                  {currentQuestionIndex < game.questions.length - 1 ? 'Next Question' : 'Finish Game'}
                </button>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  Press <kbd style={{ 
                    padding: '0.2rem 0.5rem', 
                    background: '#f5f5f5', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}>Enter</kbd> to continue
                </div>
              </>
            )}
          </div>

          {/* Current Score */}
          <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666', fontSize: 'clamp(0.9rem, 2vw, 1rem)', wordWrap: 'break-word' }}>
            Current Score: <strong style={{ color: '#667eea', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>{score}</strong> |
            Correct: <strong style={{ color: '#28a745', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>{correctAnswers}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlay;
