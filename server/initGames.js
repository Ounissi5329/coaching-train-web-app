require('dotenv').config();
const mongoose = require('mongoose');
const Game = require('./src/models/Game');

const sampleGames = [
  {
    title: 'Sudoku',
    description: 'Classic Sudoku puzzle game. Fill the grid so that each row, column, and 3x3 box contains all digits 1-9.',
    category: 'puzzle',
    difficulty: 'medium',
    icon: '🧩',
    maxScore: 100,
    timeLimit: 600
  },
  {
    title: 'Wordle',
    description: 'Guess the word in 6 tries. Get feedback on each guess to help you solve the puzzle.',
    category: 'word',
    difficulty: 'medium',
    icon: '📝',
    maxScore: 100,
    timeLimit: 300
  },
  {
    title: 'Trivia',
    description: 'Test your knowledge with multiple choice trivia questions.',
    category: 'trivia',
    difficulty: 'hard',
    icon: '🧠',
    maxScore: 100,
    timeLimit: 180
  }
];

const initGames = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/coaching-platform';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing games
    await Game.deleteMany({});
    console.log('Cleared existing games');

    // Insert sample games
    await Game.insertMany(sampleGames);
    console.log('Sample games initialized successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error initializing games:', error);
    process.exit(1);
  }
};

initGames();