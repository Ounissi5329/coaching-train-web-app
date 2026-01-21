import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI, sessionAPI, courseAPI, userAPI } from '../../services/api';
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
import { format, isToday, isTomorrow, formatDistanceToNow } from 'date-fns';

const CoachDashboard = () => {
  const { user } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [courseSessions, setCourseSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    courseId: '',
    title: '',
    description: '',
    scheduledDate: '',
    duration: 60,
    tasks: []
  });

  // Get unique enrolled students from all courses where current user is the coach
  const enrolledStudents = React.useMemo(() => {
    const studentMap = new Map();
    
    courses.forEach(course => {
      // Only include courses where the current user is the coach
      if (course.coach && (course.coach._id === user._id || course.coach === user._id)) {
        if (course.enrolledStudents) {
          course.enrolledStudents.forEach(studentId => {
            // studentId might be just an ID string or an object
            const studentIdStr = typeof studentId === 'object' ? studentId._id || studentId : studentId;
            
            // Find the student details from the clients array
            const studentData = clients.find(client => client._id === studentIdStr);
            
            if (!studentMap.has(studentIdStr)) {
              studentMap.set(studentIdStr, {
                _id: studentIdStr,
                firstName: studentData?.firstName || 'Unknown',
                lastName: studentData?.lastName || 'Student',
                avatar: studentData?.avatar,
                enrolledCourses: [course.title],
                totalCourses: 1
              });
            } else {
              const existingStudent = studentMap.get(studentIdStr);
              existingStudent.enrolledCourses.push(course.title);
              existingStudent.totalCourses += 1;
            }
          });
        }
      }
    });
    
    return Array.from(studentMap.values());
  }, [courses, clients, user._id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, sessionsRes, coursesRes, clientsRes, courseSessionsRes] = await Promise.all([
          bookingAPI.getUpcomingBookings(),
          sessionAPI.getCoachSessions(),
          courseAPI.getCoachCourses(),
          userAPI.getClients(),
          sessionAPI.getCoachSessions() // This will get course sessions
        ]);
        setUpcomingBookings(bookingsRes.data);
        setSessions(sessionsRes.data);
        setCourses(coursesRes.data);
        setClients(clientsRes.data);
        setCourseSessions(courseSessionsRes.data.filter(s => s.type === 'course-session'));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateCourseSession = async () => {
    try {
      await sessionAPI.createCourseSession(scheduleForm);
      setShowScheduleForm(false);
      setScheduleForm({
        courseId: '',
        title: '',
        description: '',
        scheduledDate: '',
        duration: 60,
        tasks: []
      });
      // Refresh course sessions
      const response = await sessionAPI.getCoachSessions();
      setCourseSessions(response.data.filter(s => s.type === 'course-session'));
    } catch (error) {
      console.error('Error creating course session:', error);
    }
  };

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your coaching business from here.</p>
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
              <div className="w-12 h-12 bg-accent-blue rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-accent-blue" />
              </div>
              <div>
                <p className="text-sm text-muted-dark">Today's Sessions</p>
                <p className="text-2xl font-bold text-primary-dark">
                  {upcomingBookings.filter(b => 
                    format(new Date(b.scheduledDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  ).length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-green rounded-xl flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-accent-green" />
              </div>
              <div>
                <p className="text-sm text-muted-dark">This Month</p>
                <p className="text-2xl font-bold text-primary-dark">$2,450</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-purple rounded-xl flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-accent-purple" />
              </div>
              <div>
                <p className="text-sm text-muted-dark">Active Students</p>
                <p className="text-2xl font-bold text-primary-dark">{enrolledStudents.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-orange rounded-xl flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-accent-orange" />
              </div>
              <div>
                <p className="text-sm text-muted-dark">Total Courses</p>
                <p className="text-2xl font-bold text-primary-dark">{courses.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-primary-dark">My Schedule</h2>
            <div className="flex gap-3">
              <Link
                to="/coach/sessions/new"
                className="btn-secondary flex items-center gap-2"
              >
                <CalendarIcon className="w-4 h-4" />
                Manage Sessions
              </Link>
              <button
                onClick={() => setShowScheduleForm(!showScheduleForm)}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Schedule Session
              </button>
            </div>
          </div>

          {showScheduleForm && (
            <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4 mb-4">
              <h3 className="text-md font-medium mb-4">Schedule New Course Session</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course
                  </label>
                  <select
                    value={scheduleForm.courseId}
                    onChange={(e) => setScheduleForm({...scheduleForm, courseId: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Session Title
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.title}
                    onChange={(e) => setScheduleForm({...scheduleForm, title: e.target.value})}
                    placeholder="e.g., Week 1 Review"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm({...scheduleForm, scheduledDate: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={scheduleForm.duration}
                    onChange={(e) => setScheduleForm({...scheduleForm, duration: parseInt(e.target.value) || 60})}
                    className="input-field"
                    min="15"
                    max="480"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm({...scheduleForm, description: e.target.value})}
                  placeholder="Session description and agenda"
                  className="input-field"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateCourseSession}
                  className="btn-primary"
                  disabled={!scheduleForm.courseId || !scheduleForm.title || !scheduleForm.scheduledDate}
                >
                  Create Session
                </button>
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {courseSessions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No scheduled sessions yet. Create your first course session above.
              </p>
            ) : (
              courseSessions.slice(0, 5).map(session => (
                <div key={session._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{session.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {session.course?.title} • {format(new Date(session.scheduledDate), 'MMM dd, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isToday(new Date(session.scheduledDate))
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : isTomorrow(new Date(session.scheduledDate))
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-gray-300'
                    }`}>
                      {isToday(new Date(session.scheduledDate))
                        ? 'Today'
                        : isTomorrow(new Date(session.scheduledDate))
                        ? 'Tomorrow'
                        : formatDistanceToNow(new Date(session.scheduledDate), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* My Students */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-primary-dark">My Students</h2>
              <Link to="/coach/courses" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                View courses <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {enrolledStudents.length === 0 ? (
              <div className="text-center py-8">
                <UserGroupIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-muted-dark">No enrolled students yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledStudents.slice(0, 4).map((student) => (
                  <div key={student._id} className="flex items-center gap-4 p-4 bg-surface-secondary rounded-xl">
                    {student.avatar ? (
                      <img src={student.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-300 font-medium text-sm">
                          {student.firstName?.[0]}{student.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-primary-dark">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-muted-dark">
                        {student.totalCourses} course{student.totalCourses !== 1 ? 's' : ''} enrolled
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-wrap gap-1 justify-end">
                        {student.enrolledCourses.slice(0, 2).map((course, index) => (
                          <span key={index} className="px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs">
                            {course}
                          </span>
                        ))}
                        {student.enrolledCourses.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                            +{student.enrolledCourses.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Schedule */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-primary-dark">My Schedule</h2>
              <Link to="/coach/sessions" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                Manage <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-muted-dark mb-3">No sessions created yet</p>
                <Link to="/coach/sessions/new" className="btn-primary inline-flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  Create Session
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.slice(0, 4).map((session) => (
                  <div key={session._id} className="flex items-center justify-between p-4 bg-surface-secondary rounded-xl">
                    <div>
                      <p className="font-medium text-primary-dark">{session.title}</p>
                      <p className="text-sm text-muted-dark">
                        {session.duration} min • {session.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-dark">${session.price}</p>
                      <p className="text-xs text-muted-dark">per session</p>
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
            <h2 className="text-lg font-semibold text-primary-dark">My Courses</h2>
            <Link to="/coach/courses" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View all <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpenIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-muted-dark mb-3">No courses created yet</p>
              <Link to="/coach/courses/new" className="btn-primary inline-flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Create Course
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {courses.slice(0, 3).map((course) => (
                <div key={course._id} className="border border-gray-100 dark:border-dark-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt="" className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <BookOpenIcon className="w-12 h-12 text-white/50" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium text-primary-dark truncate">{course.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-dark">{course.enrolledStudents?.length || 0} students</span>
                      <span className="font-semibold text-primary-600">${course.price}</span>
                    </div>
                    <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                      course.isPublished 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
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
