import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  MagnifyingGlassIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    level: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.level) params.level = filters.level;

      const response = await courseAPI.getCourses(params);
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    'Business', 'Personal Development', 'Health & Wellness', 'Career',
    'Leadership', 'Communication', 'Finance', 'Productivity'
  ];

  const levels = ['beginner', 'intermediate', 'advanced'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Online Courses</h1>
          <p className="mt-2 text-gray-600">Learn at your own pace from expert coaches</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses..."
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
            <div className="mt-4 pt-4 border-t border-gray-100 grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="input-field"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                  className="input-field"
                >
                  <option value="">All Levels</option>
                  {levels.map((level) => (
                    <option key={level} value={level} className="capitalize">{level}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <LoadingSpinner size="lg" className="mt-20" />
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <AcademicCapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No courses found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Link
                key={course._id}
                to={`/courses/${course._id}`}
                className="card p-0 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <AcademicCapIcon className="w-16 h-16 text-white/50" />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                      {course.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize">
                      {course.level}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    {course.coach?.avatar ? (
                      <img
                        src={course.coach.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-xs">
                          {course.coach?.firstName?.[0]}{course.coach?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-gray-600">
                      {course.coach?.firstName} {course.coach?.lastName}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {course.lessons?.length || 0} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4" />
                        {course.enrolledStudents?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <StarSolid className="w-4 h-4 text-yellow-400" />
                      <span>{course.rating?.toFixed(1) || '4.5'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end">
                    {/* <div>
                      <span className="text-2xl font-bold text-gray-900">${course.price}</span>
                    </div> */}
                    <span className="text-primary-600 font-medium text-sm group-hover:underline">
                      View Course →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
