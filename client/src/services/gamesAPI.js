import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const gamesAPI = {
  // Get all games
  getAllGames: async () => {
    return axios.get(`${API_URL}/games`);
  },

  // Get single game by ID
  getGameById: async (gameId) => {
    return axios.get(`${API_URL}/games/${gameId}`);
  },

  // Save game score
  saveGameScore: async (data) => {
    return axios.post(`${API_URL}/games/score/save`, data);
  },

  // Get user's game scores
  getUserGameScores: async (params) => {
    return axios.get(`${API_URL}/games/user/scores`, { params });
  },

  // Get user's best scores
  getUserBestScores: async () => {
    return axios.get(`${API_URL}/games/user/best-scores`);
  },

  // Get game statistics
  getGameStatistics: async (params) => {
    return axios.get(`${API_URL}/games/user/statistics`, { params });
  },

  // Get game leaderboard
  getGameLeaderboard: async (gameId, params) => {
    return axios.get(`${API_URL}/games/${gameId}/leaderboard`, { params });
  },

  // Admin: Create game
  createGame: async (data) => {
    return axios.post(`${API_URL}/games`, data);
  },

  // Admin: Update game
  updateGame: async (gameId, data) => {
    return axios.put(`${API_URL}/games/${gameId}`, data);
  },

  // Admin: Delete game
  deleteGame: async (gameId) => {
    return axios.delete(`${API_URL}/games/${gameId}`);
  },
};

export default gamesAPI;