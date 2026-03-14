import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { gameApi, statsApi } from '../services/api';
import { Game, Question } from '../types';

const GamePlay: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useUser();
  const navigate = useNavigate();

  const [game, setGame] = useState<Game | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [gameStartTime] = useState(Date.now());
  const [gameCompleted, setGameCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Refs for keyboard handler to access current state
  const stateRef = useRef({
    game,
    user,
    currentQuestionIndex,
    selectedOption,
    showResult,
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
      score,
      correctAnswers,
      questionStartTime
    };
  }, [game, user, currentQuestionIndex, selectedOption, showResult, score, correctAnswers, questionStartTime]);

  useEffect(() => {
    if (gameId) {
      loadGame();
    }
  }, [gameId]);

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setSelectedOption(null);
  }, [currentQuestionIndex, game]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const { game, user, currentQuestionIndex, selectedOption, showResult } = stateRef.current;
      
      if (!game || !user) return;

      const currentQuestion = game.questions[currentQuestionIndex];

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
      if (!showResult) {
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
  }, []);

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
    const answer = selectedOption || '';

    if (!answer) {
      alert('Please select an answer');
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
      await statsApi.recordQuestion({
        userId: user.userId,
        username: user.username,
        gameId: game.gameId,
        questionIndex: currentQuestionIndex,
        userAnswer: '',
        timeSpent,
      });

      setIsCorrect(false);
      setShowResult(true);
    } catch (error) {
      console.error('Error skipping question:', error);
    }
  };

  const handleNextQuestion = () => {
    if (!game) return;

    setShowResult(false);
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

          {/* Multiple Choice Options */}
          {!showResult && (
            <div className="keyboard-shortcuts-hint" style={{ 
              background: '#f0f4ff', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              color: '#666',
              wordWrap: 'break-word'
            }}>
              ⌨️ <strong>Shortcuts:</strong> Press 1-{currentQuestion.options.length} to select, ↑↓ arrows, <kbd style={{ 
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
            {currentQuestion.options.map((option, index) => (
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
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {!showResult ? (
              <>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption}
                  style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
                >
                  Submit Answer
                </button>
                <button className="btn btn-secondary" onClick={handleSkipQuestion} style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                  I Don't Know (Skip)
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={handleNextQuestion} style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                {currentQuestionIndex < game.questions.length - 1 ? 'Next Question' : 'Complete Game'}
              </button>
            )}
          </div>

          {/* Score Display */}
          <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
              Current Score: <strong style={{ color: 'var(--primary-color)' }}>{score}</strong> | 
              Correct: <strong style={{ color: '#28a745' }}>{correctAnswers}</strong>/{currentQuestionIndex + (showResult ? 1 : 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlay;
