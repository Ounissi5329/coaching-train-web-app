import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  MagnifyingGlassIcon,
  StarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const Coaches = () => {
  const { resolvedTheme } = useTheme();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    specialization: '',
    minRate: '',
    maxRate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCoaches();
  }, [filters]);

  const fetchCoaches = async () => {
    try {
      const params = {};
      if (filters.specialization) params.specialization = filters.specialization;
      if (filters.minRate) params.minRate = filters.minRate;
      if (filters.maxRate) params.maxRate = filters.maxRate;

      const response = await userAPI.getCoaches(params);
      setCoaches(response.data.coaches);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoaches = coaches.filter(coach =>
    `${coach.firstName} ${coach.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.specializations?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const specializations = [
    'Business', 'Career', 'Life', 'Health & Fitness', 'Executive',
    'Leadership', 'Relationship', 'Financial', 'Mindset'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Find Your Perfect Coach</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Browse our network of certified professionals</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Specialization
                </label>
                <select
                  value={filters.specialization}
                  onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                  className="input-field"
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Min Rate ($/hr)
                </label>
                <input
                  type="number"
                  value={filters.minRate}
                  onChange={(e) => setFilters({ ...filters, minRate: e.target.value })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Max Rate ($/hr)
                </label>
                <input
                  type="number"
                  value={filters.maxRate}
                  onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                  className="input-field"
                  placeholder="500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Coaches Grid */}
        {loading ? (
          <LoadingSpinner size="lg" className="mt-20" />
        ) : filteredCoaches.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No coaches found matching your criteria</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoaches.map((coach) => (
              <Link
                key={coach._id}
                to={`/coaches/${coach._id}`}
                className="card hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-4">
                  {coach.avatar ? (
                    <img
                      src={coach.avatar}
                      alt={`${coach.firstName} ${coach.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-300 font-semibold text-xl">
                        {coach.firstName?.[0]}{coach.lastName?.[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 transition-colors">
                      {coach.firstName} {coach.lastName}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        i < 4 ? (
                          <StarSolid key={i} className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <StarIcon key={i} className="w-4 h-4 text-gray-300" />
                        )
                      ))}
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">(24 reviews)</span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                  {coach.bio || 'Experienced coach helping clients achieve their goals through personalized guidance and support.'}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(coach.specializations || ['Life Coaching']).slice(0, 3).map((spec, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 rounded-md text-xs">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-700 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">${coach.hourlyRate || 75}</span>
                    <span className="text-gray-500 dark:text-gray-400">/hour</span>
                  </div>
                  <span className="btn-primary text-sm">View Profile</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Coaches;
