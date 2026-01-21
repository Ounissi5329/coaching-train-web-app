import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { bookingAPI, courseAPI } from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  CalendarIcon,
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const ClientDashboard = () => {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, coursesRes] = await Promise.all([
          bookingAPI.getUpcomingBookings(),
          courseAPI.getEnrolledCourses()
        ]);
        setUpcomingBookings(bookingsRes.data);
        setEnrolledCourses(coursesRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <Sidebar />
        <div className="ml-64 p-8">
          <LoadingSpinner size="lg" className="mt-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar />
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Here's what's happening with your coaching journey.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-blue rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-accent-blue" />
              </div>
              <div>
                <p className="text-sm text-muted-dark">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-primary-dark">{upcomingBookings.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-purple rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-accent-purple" />
              </div>
              <div>
                <p className="text-sm text-muted-dark">Enrolled Courses</p>
                <p className="text-2xl font-bold text-primary-dark">{enrolledCourses.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-green rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-accent-green" />
              </div>
              <div>
                <p className="text-sm text-muted-dark">Completed Sessions</p>
                <p className="text-2xl font-bold text-primary-dark">12</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-orange rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-accent-orange" />
              </div>
              <div>
                <p className="text-sm text-muted-dark">Goals Achieved</p>
                <p className="text-2xl font-bold text-primary-dark">5</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-primary-dark">Upcoming Sessions</h2>
              <Link to="/client/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                View all <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-muted-dark">No upcoming sessions</p>
                <Link to="/client/coaches" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
                  Find a coach
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.slice(0, 3).map((booking) => (
                  <div key={booking._id} className="flex items-center gap-4 p-4 bg-surface-secondary rounded-xl">
                    {booking.coach?.avatar ? (
                      <img src={booking.coach.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-300 font-medium">
                          {booking.coach?.firstName?.[0]}{booking.coach?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-primary-dark">{booking.session?.title}</p>
                      <p className="text-sm text-muted-dark">
                        with {booking.coach?.firstName} {booking.coach?.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary-dark">
                        {format(new Date(booking.scheduledDate), 'MMM d')}
                      </p>
                      <p className="text-sm text-muted-dark">{booking.startTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Courses */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-primary-dark">My Courses</h2>
              <Link to="/client/courses" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                View all <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {enrolledCourses.length === 0 ? (
              <div className="text-center py-8">
                <AcademicCapIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-muted-dark">No courses enrolled</p>
                <Link to="/courses" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
                  Browse courses
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledCourses.slice(0, 3).map((course) => (
                  <Link to={`/courses/${course._id}`} key={course._id} className="flex items-center gap-4 p-4 bg-surface-secondary hover:bg-surface-tertiary rounded-xl transition-colors">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" className="w-16 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                        <AcademicCapIcon className="w-6 h-6 text-primary-600 dark:text-primary-300" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-primary-dark">{course.title}</p>
                      <p className="text-sm text-muted-dark">
                        by {course.coach?.firstName} {course.coach?.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-dark-700 rounded-full">
                        <div className="h-full bg-primary-600 rounded-full" style={{ width: `${course.progress || 0}%` }}></div>
                      </div>
                      <p className="text-xs text-muted-dark mt-1">{course.progress || 0}% complete</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 card">
          <h2 className="text-lg font-semibold text-primary-dark mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/client/coaches" className="p-4 bg-surface-secondary hover:bg-surface-tertiary rounded-xl hover transition-colors text-center">
              <CalendarIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-secondary-dark">Book Session</span>
            </Link>
            <Link to="/courses" className="p-4 bg-surface-secondary hover:bg-surface-tertiary rounded-xl hover transition-colors text-center">
              <AcademicCapIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-secondary-dark">Browse Courses</span>
            </Link>
            <Link to="/client/messages" className="p-4 bg-surface-secondary hover:bg-surface-tertiary rounded-xl hover transition-colors text-center">
              <svg className="w-8 h-8 text-primary-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium text-secondary-dark">Messages</span>
            </Link>
            <Link to="/client/progress" className="p-4 bg-surface-secondary hover:bg-surface-tertiary rounded-xl hover transition-colors text-center">
              <ChartBarIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-secondary-dark">View Progress</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
