import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI, sessionAPI, courseAPI } from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  ArrowRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const CoachDashboard = () => {
  const { user } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, sessionsRes, coursesRes] = await Promise.all([
          bookingAPI.getUpcomingBookings(),
          sessionAPI.getCoachSessions(),
          courseAPI.getCoachCourses()
        ]);
        setUpcomingBookings(bookingsRes.data);
        setSessions(sessionsRes.data);
        setCourses(coursesRes.data);
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600 mt-1">Manage your coaching business from here.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/coach/sessions/new" className="btn-secondary flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              New Session
            </Link>
            <Link to="/coach/courses/new" className="btn-primary flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              New Course
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Today's Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingBookings.filter(b => 
                    format(new Date(b.scheduledDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  ).length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-gray-900">$2,450</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Bookings</h2>
              <Link to="/coach/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                View all <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming bookings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.slice(0, 4).map((booking) => (
                  <div key={booking._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    {booking.client?.avatar ? (
                      <img src={booking.client.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-sm">
                          {booking.client?.firstName?.[0]}{booking.client?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {booking.client?.firstName} {booking.client?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{booking.session?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(booking.scheduledDate), 'MMM d')}
                      </p>
                      <p className="text-sm text-gray-500">{booking.startTime}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Sessions */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">My Session Types</h2>
              <Link to="/coach/sessions" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                Manage <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">No sessions created yet</p>
                <Link to="/coach/sessions/new" className="btn-primary inline-flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  Create Session
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.slice(0, 4).map((session) => (
                  <div key={session._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">{session.title}</p>
                      <p className="text-sm text-gray-500">
                        {session.duration} min • {session.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${session.price}</p>
                      <p className="text-xs text-gray-500">per session</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Courses */}
        <div className="mt-6 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
            <Link to="/coach/courses" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View all <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">No courses created yet</p>
              <Link to="/coach/courses/new" className="btn-primary inline-flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Create Course
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {courses.slice(0, 3).map((course) => (
                <div key={course._id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt="" className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <BookOpenIcon className="w-12 h-12 text-white/50" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate">{course.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">{course.enrolledStudents?.length || 0} students</span>
                      <span className="font-semibold text-primary-600">${course.price}</span>
                    </div>
                    <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                      course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
