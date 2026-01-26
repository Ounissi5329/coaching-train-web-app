const mongoose = require('mongoose');
const Game = require('../models/Game');
const GameScore = require('../models/GameScore');

// Get all available games
exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: games,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching games',
      error: error.message,
    });
  }
};

// Get single game by ID
exports.getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }
    res.status(200).json({
      success: true,
      data: game,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching game',
      error: error.message,
    });
  }
};

// Save game score
exports.saveGameScore = async (req, res) => {
  try {
    const { gameId, score, timeSpent, difficulty, gameData } = req.body;
    const userId = req.user.id;

    // Validate game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    // Create game score record
    const gameScore = new GameScore({
      user: userId,
      game: gameId,
      score,
      timeSpent,
      difficulty,
      isCompleted: true,
      gameData: gameData || {},
    });

    await gameScore.save();
    await gameScore.populate('game');

    res.status(201).json({
      success: true,
      message: 'Game score saved successfully',
      data: gameScore,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving game score',
      error: error.message,
    });
  }
};

// Get user's game scores
exports.getUserGameScores = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId, limit = 10, page = 1 } = req.query;

    let query = { user: userId };
    if (gameId) {
      query.game = gameId;
    }

    const skip = (page - 1) * limit;

    const scores = await GameScore.find(query)
      .populate('game')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await GameScore.countDocuments(query);

    res.status(200).json({
      success: true,
      data: scores,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user game scores',
      error: error.message,
    });
  }
};

// Get game leaderboard
exports.getGameLeaderboard = async (req, res) => {
  try {
    const { gameId, limit = 10, timeframe = 'all' } = req.query;

    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: 'Game ID is required',
      });
    }

    // Build date filter for timeframe
    let dateFilter = {};
    const now = new Date();
    if (timeframe === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { createdAt: { $gte: startOfDay } };
    } else if (timeframe === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (timeframe === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: monthAgo } };
    }

    const leaderboard = await GameScore.find({
      game: gameId,
      isCompleted: true,
      ...dateFilter,
    })
      .populate('user', 'firstName lastName avatar')
      .sort({ score: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: leaderboard,
      timeframe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message,
    });
  }
};

// Get user's best scores for each game
exports.getUserBestScores = async (req, res) => {
  try {
    const userId = req.user.id;

    const bestScores = await GameScore.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId), isCompleted: true } },
      { $group: { _id: '$game', maxScore: { $max: '$score' }, latestDate: { $max: '$createdAt' } } },
      { $lookup: { from: 'games', localField: '_id', foreignField: '_id', as: 'gameInfo' } },
      { $sort: { latestDate: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: bestScores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching best scores',
      error: error.message,
    });
  }
};

// Get game statistics
exports.getGameStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.query;

    let query = { user: userId, isCompleted: true };
    if (gameId) {
      query.game = gameId;
    }

    const stats = await GameScore.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$game',
          totalGames: { $sum: 1 },
          averageScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
          minScore: { $min: '$score' },
          totalTimeSpent: { $sum: '$timeSpent' },
        },
      },
      { $lookup: { from: 'games', localField: '_id', foreignField: '_id', as: 'gameInfo' } },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};

// Admin: Create new game
exports.createGame = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create games',
      });
    }

    const { title, description, category, difficulty, icon, maxScore, timeLimit } = req.body;

    const game = new Game({
      title,
      description,
      category,
      difficulty,
      icon,
      maxScore,
      timeLimit,
    });

    await game.save();

    res.status(201).json({
      success: true,
      message: 'Game created successfully',
      data: game,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating game',
      error: error.message,
    });
  }
};

// Admin: Update game
exports.updateGame = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update games',
      });
    }

    const game = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Game updated successfully',
      data: game,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating game',
      error: error.message,
    });
  }
};

// Admin: Delete game
exports.deleteGame = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete games',
      });
    }

    const game = await Game.findByIdAndDelete(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Game deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting game',
      error: error.message,
    });
  }
};