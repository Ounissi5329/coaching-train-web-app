import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gamesAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ArrowLeftIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const WORD_LIST = [
  'REACT',
  'JAVASCRIPT',
  'PYTHON',
  'DATABASE',
  'ALGORITHM',
  'FUNCTION',
  'VARIABLE',
  'COMPONENT',
  'INTERFACE',
  'NETWORK',
  'SECURITY',
  'PERFORMANCE',
  'OPTIMIZATION',
  'FRAMEWORK',
  'LIBRARY',
];

const WordleGame = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [score, setScore] = useState(0);

  const MAX_GUESSES = 6;

  useEffect(() => {
    fetchGame();
    setStartTime(Date.now());
  }, [gameId]);

  useEffect(() => {
    if (gameState === 'playing' && startTime) {
      const timer = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, gameState]);

  useEffect(() => {
    const word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setTargetWord(word);
  }, []);

  const fetchGame = async () => {
    try {
      setLoading(true);
      const response = await gamesAPI.getGameById(gameId);
      const gameData = response.data.data || response.data;
      setGame(gameData);
    } catch (error) {
      console.error('Error fetching game:', error);
      toast.error('Failed to load game');
      navigate('/games');
    } finally {
      setLoading(false);
    }
  };

  const getLetterColor = (letter, index) => {
    if (targetWord[index] === letter) {
      return 'bg-green-500 text-white'; // Correct position
    } else if (targetWord.includes(letter)) {
      return 'bg-yellow-500 text-white'; // Wrong position
    } else {
      return 'bg-gray-400 text-white'; // Not in word
    }
  };

  const handleKeyPress = (e) => {
    if (gameState !== 'playing') return;

    const letter = e.key.toUpperCase();

    if (/^[A-Z]$/.test(letter)) {
      if (currentGuess.length < targetWord.length) {
        setCurrentGuess(currentGuess + letter);
      }
    } else if (e.key === 'Backspace') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (e.key === 'Enter') {
      handleSubmitGuess();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentGuess, gameState]);

  const handleSubmitGuess = () => {
    if (currentGuess.length !== targetWord.length) {
      toast.error(`Word must be ${targetWord.length} letters`);
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);

    if (currentGuess === targetWord) {
      const calculatedScore = Math.max(100 - (newGuesses.length - 1) * 15, 10);
      setScore(calculatedScore);
      setGameState('won');
      saveGameScore(calculatedScore);
      toast.success('You won! Great job!');
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameState('lost');
      saveGameScore(0);
      toast.error(`Game Over! The word was: ${targetWord}`);
    }

    setCurrentGuess('');
  };

  const saveGameScore = async (finalScore) => {
    try {
      await gamesAPI.saveGameScore({
        gameId,
        score: finalScore,
        timeSpent,
        difficulty: 'medium',
        gameData: { targetWord, guesses },
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const resetGame = () => {
    const word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setTargetWord(word);
    setGuesses([]);
    setCurrentGuess('');
    setGameState('playing');
    setScore(0);
    setStartTime(Date.now());
    setTimeSpent(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !targetWord) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800 pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/games')}
            className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Games
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {game?.title || 'Word Guess'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Guess the word in {MAX_GUESSES} tries
            </p>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-dark-800 rounded-lg p-4 text-center border border-gray-200 dark:border-dark-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Time Spent</div>
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-2">
              {formatTime(timeSpent)}
            </div>
          </div>
          <div className="bg-white dark:bg-dark-800 rounded-lg p-4 text-center border border-gray-200 dark:border-dark-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Attempts</div>
            <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400 mt-2">
              {guesses.length}/{MAX_GUESSES}
            </div>
          </div>
          <div className="bg-white dark:bg-dark-800 rounded-lg p-4 text-center border border-gray-200 dark:border-dark-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
              {score}
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-dark-700 mb-8">
          <div className="space-y-2 mb-6">
            {/* Previous Guesses */}
            {guesses.map((guess, guessIdx) => (
              <div key={guessIdx} className="flex gap-2 justify-center">
                {guess.split('').map((letter, letterIdx) => (
                  <div
                    key={letterIdx}
                    className={`w-12 h-12 flex items-center justify-center text-lg font-bold rounded ${getLetterColor(
                      letter,
                      letterIdx
                    )}`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            ))}

            {/* Current Guess */}
            {gameState === 'playing' && (
              <div className="flex gap-2 justify-center">
                {Array(targetWord.length)
                  .fill(null)
                  .map((_, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 flex items-center justify-center text-lg font-bold rounded bg-gray-100 dark:bg-dark-700 border-2 border-gray-300 dark:border-dark-600 text-gray-900 dark:text-white"
                    >
                      {currentGuess[idx] || ''}
                    </div>
                  ))}
              </div>
            )}

            {/* Empty Rows */}
            {gameState === 'playing' &&
              Array(MAX_GUESSES - guesses.length - 1)
                .fill(null)
                .map((_, rowIdx) => (
                  <div key={`empty-${rowIdx}`} className="flex gap-2 justify-center">
                    {Array(targetWord.length)
                      .fill(null)
                      .map((_, colIdx) => (
                        <div
                          key={colIdx}
                          className="w-12 h-12 flex items-center justify-center rounded bg-gray-100 dark:bg-dark-700 border-2 border-gray-300 dark:border-dark-600"
                        />
                      ))}
                  </div>
                ))}
          </div>

          {/* Game Result */}
          {gameState === 'won' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-200 dark:border-green-800 p-6 text-center">
              <CheckIcon className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
                You Won!
              </h2>
              <p className="text-green-600 dark:text-green-300 mt-2">
                The word was: <span className="font-bold">{targetWord}</span>
              </p>
            </div>
          )}

          {gameState === 'lost' && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border-2 border-red-200 dark:border-red-800 p-6 text-center">
              <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">
                Game Over!
              </h2>
              <p className="text-red-600 dark:text-red-300 mt-2">
                The word was: <span className="font-bold">{targetWord}</span>
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {gameState === 'playing' && (
            <button
              onClick={handleSubmitGuess}
              disabled={currentGuess.length !== targetWord.length}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
            >
              <CheckIcon className="w-5 h-5" />
              Submit Guess
            </button>
          )}
          {gameState !== 'playing' && (
            <>
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Play Again
              </button>
              <button
                onClick={() => navigate('/games')}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-dark-600 font-semibold rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Games
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordleGame;