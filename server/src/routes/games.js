const express = require('express');
const router = express.Router();
const { protect: authenticate } = require('../middleware/auth');
const gameController = require('../controllers/gameController');

// Public routes
router.get('/', gameController.getAllGames);
router.get('/:id', gameController.getGameById);
router.get('/:id/leaderboard', gameController.getGameLeaderboard);

// Protected routes (requires authentication)
router.post('/score/save', authenticate, gameController.saveGameScore);
router.get('/user/scores', authenticate, gameController.getUserGameScores);
router.get('/user/best-scores', authenticate, gameController.getUserBestScores);
router.get('/user/statistics', authenticate, gameController.getGameStatistics);

// Admin routes
router.post('/', authenticate, gameController.createGame);
router.put('/:id', authenticate, gameController.updateGame);
router.delete('/:id', authenticate, gameController.deleteGame);

module.exports = router;