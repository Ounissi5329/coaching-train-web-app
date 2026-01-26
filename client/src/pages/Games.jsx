// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { gamesAPI } from '../services/api';
// import LoadingSpinner from '../components/common/LoadingSpinner';
// import {
//   SparklesIcon,
//   TrophyIcon,
//   FireIcon,
//   ClockIcon,
// } from '@heroicons/react/24/outline';
// import toast from 'react-hot-toast';

// const Games = () => {
//   const navigate = useNavigate();
//   const { isAuthenticated } = useAuth();
//   const [games, setGames] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [userScores, setUserScores] = useState({});

//   useEffect(() => {
//     fetchGames();
//     if (isAuthenticated) {
//       fetchUserScores();
//     }
//   }, [isAuthenticated]);

//   const fetchGames = async () => {
//     try {
//       setLoading(true);
//       const response = await gamesAPI.getAllGames();
//       setGames(response.data.data || []);
//     } catch (error) {
//       console.error('Error fetching games:', error);
//       toast.error('Failed to load games');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUserScores = async () => {
//     try {
//       const response = await gamesAPI.getUserBestScores();
//       const scoresMap = {};
//       response.data.data?.forEach((score) => {
//         scoresMap[score._id] = score.maxScore;
//       });
//       setUserScores(scoresMap);
//     } catch (error) {
//       console.error('Error fetching user scores:', error);
//     }
//   };

//   const handlePlayGame = (gameId) => {
//     if (!isAuthenticated) {
//       toast.error('Please sign in to play games');
//       navigate('/login');
//       return;
//     }
//     navigate(`/games/${gameId}`);
//   };

//   const filteredGames =
//     selectedCategory === 'all'
//       ? games
//       : games.filter((game) => game.category === selectedCategory);

//   const categories = [
//     { id: 'all', name: 'All Games', icon: '🎮' },
//     { id: 'puzzle', name: 'Puzzles', icon: '🧩' },
//     { id: 'word', name: 'Word Games', icon: '📝' },
//     { id: 'trivia', name: 'Trivia', icon: '🧠' },
//     { id: 'memory', name: 'Memory', icon: '💭' },
//     { id: 'math', name: 'Math', icon: '🔢' },
//   ];

//   const getGameIcon = (category) => {
//     const iconMap = {
//       puzzle: '🧩',
//       word: '📝',
//       trivia: '🧠',
//       memory: '💭',
//       math: '🔢',
//     };
//     return iconMap[category] || '🎮';
//   };

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800 pt-20 pb-12">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <div className="flex items-center justify-center gap-3 mb-4">
//             <SparklesIcon className="w-8 h-8 text-primary-600" />
//             <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
//               Games Hub
//             </h1>
//             <SparklesIcon className="w-8 h-8 text-primary-600" />
//           </div>
//           <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
//             Challenge your mind with our collection of engaging games. Compete with your network,
//             improve your skills, and climb the leaderboards!
//           </p>
//         </div>

//         {/* Category Filter */}
//         <div className="mb-12">
//           <div className="flex flex-wrap gap-3 justify-center">
//             {categories.map((category) => (
//               <button
//                 key={category.id}
//                 onClick={() => setSelectedCategory(category.id)}
//                 className={`px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
//                   selectedCategory === category.id
//                     ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
//                     : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-700 border border-gray-200 dark:border-dark-700'
//                 }`}
//               >
//                 <span>{category.icon}</span>
//                 {category.name}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Games Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredGames.length > 0 ? (
//             filteredGames.map((game) => (
//               <div
//                 key={game._id}
//                 className="group bg-white dark:bg-dark-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-600"
//               >
//                 {/* Game Card Header */}
//                 <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-8 text-center">
//                   <div className="text-6xl mb-3">{getGameIcon(game.category)}</div>
//                   <h2 className="text-2xl font-bold text-white">{game.title}</h2>
//                 </div>

//                 {/* Game Card Content */}
//                 <div className="p-6">
//                   <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
//                     {game.description}
//                   </p>

//                   {/* Game Stats */}
//                   <div className="grid grid-cols-2 gap-3 mb-6">
//                     <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3 text-center">
//                       <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
//                         {game.maxScore}
//                       </div>
//                       <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
//                         Max Score
//                       </div>
//                     </div>
//                     <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3 text-center">
//                       <div className="flex items-center justify-center gap-1 text-lg font-bold text-secondary-600 dark:text-secondary-400">
//                         <ClockIcon className="w-4 h-4" />
//                         {Math.floor(game.timeLimit / 60)}m
//                       </div>
//                       <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
//                         Time Limit
//                       </div>
//                     </div>
//                   </div>

//                   {/* User Best Score */}
//                   {isAuthenticated && userScores[game._id] && (
//                     <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-dark-700 dark:to-dark-700 rounded-lg p-3 mb-6 border border-yellow-200 dark:border-dark-600">
//                       <div className="flex items-center gap-2">
//                         <TrophyIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
//                         <div>
//                           <div className="text-xs text-gray-600 dark:text-gray-400">
//                             Your Best Score
//                           </div>
//                           <div className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
//                             {userScores[game._id]}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Difficulty Badge */}
//                   <div className="flex items-center gap-2 mb-6">
//                     <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
//                       Difficulty:
//                     </span>
//                     <span
//                       className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
//                         game.difficulty === 'easy'
//                           ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
//                           : game.difficulty === 'medium'
//                           ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
//                           : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
//                       }`}
//                     >
//                       {game.difficulty}
//                     </span>
//                   </div>

//                   {/* Play Button */}
//                   <button
//                     onClick={() => handlePlayGame(game._id)}
//                     className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform group-hover:scale-105 flex items-center justify-center gap-2"
//                   >
//                     <FireIcon className="w-5 h-5" />
//                     Play Now
//                   </button>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="col-span-full text-center py-12">
//               <div className="text-6xl mb-4">🎮</div>
//               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//                 No games found
//               </h3>
//               <p className="text-gray-600 dark:text-gray-300">
//                 Check back soon for more games in this category!
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Leaderboard Section */}
//         {isAuthenticated && (
//           <div className="mt-16 bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-dark-700">
//             <div className="flex items-center gap-3 mb-6">
//               <TrophyIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
//               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//                 Top Players This Week
//               </h2>
//             </div>
//             <p className="text-gray-600 dark:text-gray-300 text-center py-8">
//               Play games to see the leaderboard! Your scores will appear here as you compete.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Games;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gamesAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  SparklesIcon,
  TrophyIcon,
  FireIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Games = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userScores, setUserScores] = useState({});

  useEffect(() => {
    fetchGames();
    if (isAuthenticated) {
      fetchUserScores();
    }
  }, [isAuthenticated]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await gamesAPI.getAllGames();
      setGames(response.data.data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserScores = async () => {
    try {
      const response = await gamesAPI.getUserBestScores();
      const scoresMap = {};
      response.data.data?.forEach((score) => {
        scoresMap[score._id] = score.maxScore;
      });
      setUserScores(scoresMap);
    } catch (error) {
      console.error('Error fetching user scores:', error);
    }
  };

  const handlePlayGame = (game) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to play games');
      navigate('/login');
      return;
    }
    
    const gameType = game.title.toLowerCase();
    if (gameType.includes('sudoku')) {
      navigate(`/games/sudoku/${game._id}`);
    } else if (gameType.includes('wordle') || gameType.includes('word')) {
      navigate(`/games/wordle/${game._id}`);
    } else {
      navigate(`/games/${game._id}`);
    }
  };

  const filteredGames =
    selectedCategory === 'all'
      ? games
      : games.filter((game) => game.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Games', icon: '🎮' },
    { id: 'puzzle', name: 'Puzzles', icon: '🧩' },
    { id: 'word', name: 'Word Games', icon: '📝' },
    { id: 'trivia', name: 'Trivia', icon: '🧠' },
    { id: 'memory', name: 'Memory', icon: '💭' },
    { id: 'math', name: 'Math', icon: '🔢' },
  ];

  const getGameIcon = (category) => {
    const iconMap = {
      puzzle: '🧩',
      word: '📝',
      trivia: '🧠',
      memory: '💭',
      math: '🔢',
    };
    return iconMap[category] || '🎮';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <SparklesIcon className="w-8 h-8 text-primary-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Games Hub
            </h1>
            <SparklesIcon className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Challenge your mind with our collection of engaging games. Compete with your network,
            improve your skills, and climb the leaderboards!
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-700 border border-gray-200 dark:border-dark-700'
                }`}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <div
                key={game._id}
                className="group bg-white dark:bg-dark-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-600"
              >
                {/* Game Card Header */}
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-8 text-center">
                  <div className="text-6xl mb-3">{getGameIcon(game.category)}</div>
                  <h2 className="text-2xl font-bold text-white">{game.title}</h2>
                </div>

                {/* Game Card Content */}
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    {game.description}
                  </p>

                  {/* Game Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {game.maxScore}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Max Score
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-lg font-bold text-secondary-600 dark:text-secondary-400">
                        <ClockIcon className="w-4 h-4" />
                        {Math.floor(game.timeLimit / 60)}m
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Time Limit
                      </div>
                    </div>
                  </div>

                  {/* User Best Score */}
                  {isAuthenticated && userScores[game._id] && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-dark-700 dark:to-dark-700 rounded-lg p-3 mb-6 border border-yellow-200 dark:border-dark-600">
                      <div className="flex items-center gap-2">
                        <TrophyIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Your Best Score
                          </div>
                          <div className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                            {userScores[game._id]}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Difficulty Badge */}
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Difficulty:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        game.difficulty === 'easy'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : game.difficulty === 'medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {game.difficulty}
                    </span>
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={() => handlePlayGame(game)}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform group-hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <FireIcon className="w-5 h-5" />
                    Play Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No games found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Check back soon for more games in this category!
              </p>
            </div>
          )}
        </div>

        {/* Leaderboard Section */}
        {isAuthenticated && (
          <div className="mt-16 bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-dark-700">
            <div className="flex items-center gap-3 mb-6">
              <TrophyIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Top Players This Week
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-center py-8">
              Play games to see the leaderboard! Your scores will appear here as you compete.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;