import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gamesAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ArrowLeftIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SudokuGame = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [board, setBoard] = useState(null);
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchGame();
    setStartTime(Date.now());
  }, [gameId]);

  useEffect(() => {
    if (!gameCompleted && startTime) {
      const timer = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, gameCompleted]);

  const fetchGame = async () => {
    try {
      setLoading(true);
      const response = await gamesAPI.getGameById(gameId);
const gameData = response.data.data || response.data;
      setGame(gameData);      generateSudokuBoard();
    } catch (error) {
      console.error('Error fetching game:', error);
      toast.error('Failed to load game');
      navigate('/games');
    } finally {
      setLoading(false);
    }
  };

  const generateSudokuBoard = () => {
    // Generate a simple Sudoku puzzle (simplified version)
    const emptyBoard = Array(9)
      .fill(null)
      .map(() => Array(9).fill(0));

    const solvedBoard = Array(9)
      .fill(null)
      .map(() => Array(9).fill(0));

    // Fill diagonal 3x3 boxes
    for (let box = 0; box < 3; box++) {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      let idx = 0;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const row = box * 3 + i;
          const col = box * 3 + j;
          solvedBoard[row][col] = nums[idx++];
          emptyBoard[row][col] = nums[idx - 1];
        }
      }
    }

    // Remove some numbers for the puzzle
    const puzzleBoard = emptyBoard.map((row) => [...row]);
    let removed = 0;
    while (removed < 40) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (puzzleBoard[row][col] !== 0) {
        puzzleBoard[row][col] = 0;
        removed++;
      }
    }

    setBoard(puzzleBoard);
    setSolution(solvedBoard);
  };

  const handleCellChange = (row, col, value) => {
    if (board[row][col] === 0 || board[row][col] === undefined) {
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = value ? parseInt(value) : 0;
      setBoard(newBoard);
    }
  };

  const checkSolution = () => {
    let correct = true;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== solution[i][j]) {
          correct = false;
          break;
        }
      }
      if (!correct) break;
    }

    if (correct) {
      const calculatedScore = Math.max(100 - Math.floor(timeSpent / 10), 10);
      setScore(calculatedScore);
      setGameCompleted(true);
      saveGameScore(calculatedScore);
      toast.success('Congratulations! You solved the Sudoku!');
    } else {
      toast.error('Some cells are incorrect. Keep trying!');
    }
  };

  const saveGameScore = async (finalScore) => {
    try {
      await gamesAPI.saveGameScore({
        gameId,
        score: finalScore,
        timeSpent,
        difficulty: 'medium',
        gameData: { board, solution },
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const resetGame = () => {
    generateSudokuBoard();
    setGameCompleted(false);
    setScore(0);
    setStartTime(Date.now());
    setTimeSpent(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !board || !solution) {
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
              {game?.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{game?.description}</p>
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
            <div className="text-sm text-gray-600 dark:text-gray-400">Difficulty</div>
            <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400 mt-2 capitalize">
              {game?.difficulty}
            </div>
          </div>
          <div className="bg-white dark:bg-dark-800 rounded-lg p-4 text-center border border-gray-200 dark:border-dark-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Max Score</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
              {game?.maxScore}
            </div>
          </div>
        </div>

        {/* Sudoku Board */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-dark-700 mb-8">
          <div className="grid grid-cols-9 gap-0 border-2 border-gray-900 dark:border-gray-100 w-fit mx-auto">
            {board.map((row, rowIdx) => (
              row.map((cell, colIdx) => {
                const boxRow = Math.floor(rowIdx / 3);
                const boxCol = Math.floor(colIdx / 3);
                const isBoxBorder =
                  (rowIdx + 1) % 3 === 0 && rowIdx !== 8
                    ? 'border-b-2'
                    : 'border-b';
                const isColBorder =
                  (colIdx + 1) % 3 === 0 && colIdx !== 8
                    ? 'border-r-2'
                    : 'border-r';

                return (
                  <input
                    key={`${rowIdx}-${colIdx}`}
                    type="number"
                    min="1"
                    max="9"
                    value={cell === 0 ? '' : cell}
                    onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                    disabled={cell !== 0}
                    className={`w-10 h-10 text-center font-bold text-lg border border-gray-300 dark:border-dark-600 ${
                      isBoxBorder
                    } ${isColBorder} ${
                      cell !== 0
                        ? 'bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white cursor-not-allowed'
                        : 'bg-white dark:bg-dark-800 text-primary-600 dark:text-primary-400'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-primary-50 dark:focus:bg-dark-700`}
                  />
                );
              })
            ))}
          </div>
        </div>

        {/* Game Result */}
        {gameCompleted && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800 p-8 mb-8">
            <div className="text-center">
              <CheckIcon className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-2">
                Puzzle Solved!
              </h2>
              <p className="text-green-600 dark:text-green-300 mb-4">
                Great job! You completed the Sudoku puzzle.
              </p>
              <div className="text-5xl font-bold text-green-700 dark:text-green-400 mb-2">
                {score} pts
              </div>
              <p className="text-green-600 dark:text-green-300 text-sm">
                Time: {formatTime(timeSpent)}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {!gameCompleted && (
            <>
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-dark-600 font-semibold rounded-lg transition-colors"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Reset
              </button>
              <button
                onClick={checkSolution}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
              >
                <CheckIcon className="w-5 h-5" />
                Check Solution
              </button>
            </>
          )}
          {gameCompleted && (
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

export default SudokuGame;

