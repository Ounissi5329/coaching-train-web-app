import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64 p-8">
          <LoadingSpinner size="lg" className="mt-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your coaching journey.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingBookings.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed Sessions</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Goals Achieved</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h2>
              <Link to="/client/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                View all <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming sessions</p>
                <Link to="/client/coaches" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
                  Find a coach
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.slice(0, 3).map((booking) => (
                  <div key={booking._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    {booking.coach?.avatar ? (
                      <img src={booking.coach.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {booking.coach?.firstName?.[0]}{booking.coach?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{booking.session?.title}</p>
                      <p className="text-sm text-gray-500">
                        with {booking.coach?.firstName} {booking.coach?.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {format(new Date(booking.scheduledDate), 'MMM d')}
                      </p>
                      <p className="text-sm text-gray-500">{booking.startTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Courses */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
              <Link to="/client/courses" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                View all <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {enrolledCourses.length === 0 ? (
              <div className="text-center py-8">
                <AcademicCapIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No courses enrolled</p>
                <Link to="/courses" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
                  Browse courses
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledCourses.slice(0, 3).map((course) => (
                  <div key={course._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" className="w-16 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <AcademicCapIcon className="w-6 h-6 text-primary-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{course.title}</p>
                      <p className="text-sm text-gray-500">
                        by {course.coach?.firstName} {course.coach?.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="h-full bg-primary-600 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">30% complete</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/client/coaches" className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center">
              <CalendarIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Book Session</span>
            </Link>
            <Link to="/courses" className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center">
              <AcademicCapIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Browse Courses</span>
            </Link>
            <Link to="/client/messages" className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center">
              <svg className="w-8 h-8 text-primary-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Messages</span>
            </Link>
            <Link to="/client/progress" className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center">
              <ChartBarIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">View Progress</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
