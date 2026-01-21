import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CourseChatbot from '../components/chat/CourseChatbot';
import PaymentModal from '../components/payment/PaymentModal';
import {
  MagnifyingGlassIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const Courses = () => {
  const { resolvedTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    level: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, course: null });

  // Check if user is admin or coach (no payment required)
  const isAdminOrCoach = user && (user.role === 'admin' || user.role === 'coach');

  useEffect(() => {
    fetchCourses();
  }, [filters, isAuthenticated, user]);

  const fetchCourses = async () => {
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.level) params.level = filters.level;

      const response = await courseAPI.getCourses(params);
      setCourses(response.data.courses);

      // Fetch enrolled courses if user is authenticated
      if (isAuthenticated && user) {
        try {
          const enrolledResponse = await courseAPI.getEnrolledCourses();
          setEnrolledCourses(enrolledResponse.data);
        } catch (error) {
          console.error('Error fetching enrolled courses:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (course) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    // Admins and coaches get immediate access
    if (isAdminOrCoach) {
      // Navigate to course details - they have access as admin/coach
      window.location.href = `/courses/${course._id}`;
      return;
    }

    if (course.price > 0) {
      // Paid course - open payment modal
      setPaymentModal({
        isOpen: true,
        course: course
      });
    } else {
      // Free course - enroll directly
      setEnrollingCourseId(course._id);
      try {
        await courseAPI.enrollCourse(course._id);
        // Refresh courses to update enrollment status
        await fetchCourses();
        alert('Successfully enrolled in the course! You now have access to all course content.');
      } catch (error) {
        console.error('Error enrolling in course:', error);
        alert('Failed to enroll in course. Please try again.');
      } finally {
        setEnrollingCourseId(null);
      }
    }
  };

  const handlePaymentSuccess = async () => {
    setPaymentModal({ isOpen: false, course: null });
    await fetchCourses();
    // The toast notification is already shown in CheckoutForm
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course._id === courseId);
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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Online Courses</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Learn at your own pace from expert coaches</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 p-4 mb-8">
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
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-700 grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="input-field select-dark"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Level
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                  className="input-field select-dark"
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
            <AcademicCapIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No courses found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Link
                key={course._id}
                to={`/courses/${course._id}`}
                className="card p-0 overflow-hidden hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary-900/10 transition-all duration-200 group"
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
                    <span className="px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs font-medium">
                      {course.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 rounded text-xs capitalize">
                      {course.level}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
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
                      <div className="w-8 h-8 bg-gray-200 dark:bg-dark-700 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-300 font-medium text-xs">
                          {course.coach?.firstName?.[0]}{course.coach?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {course.coach?.firstName} {course.coach?.lastName}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
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

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-700 flex items-center justify-between">
                    <div>
                      {isAdminOrCoach ? (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {course.price > 0 ? `Price: $${course.price}` : 'Free Course'}
                        </span>
                      ) : (
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {course.price > 0 ? `$${course.price}` : 'Free'}
                        </span>
                      )}
                    </div>
                    {isAdminOrCoach ? (
                      <Link
                        to={`/courses/${course._id}`}
                        className="btn-primary text-sm"
                      >
                        View Course
                      </Link>
                    ) : isEnrolled(course._id) ? (
                      <Link
                        to={`/courses/${course._id}`}
                        className="btn-secondary text-sm"
                      >
                        Continue Learning
                      </Link>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleEnroll(course);
                        }}
                        disabled={enrollingCourseId === course._id}
                        className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enrollingCourseId === course._id ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Enrolling...
                          </div>
                        ) : (
                          course.price > 0 ? 'Buy Now' : 'Enroll Free'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Course Chatbot */}
      <CourseChatbot courses={courses} />

      {/* Payment Modal - Only for non-admin/coach users */}
      {!isAdminOrCoach && (
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ isOpen: false, course: null })}
          data={{
            courseId: paymentModal.course?._id,
            title: paymentModal.course?.title,
            amount: paymentModal.course?.price
          }}
          type="course"
        />
      )}
    </div>
  );
};

export default Courses;
