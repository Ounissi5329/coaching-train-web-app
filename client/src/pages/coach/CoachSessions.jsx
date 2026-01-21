import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { sessionAPI, courseAPI } from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  CalendarIcon,
  PlusIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { format, isToday, isTomorrow, formatDistanceToNow, addDays } from 'date-fns';

const CoachSessions = () => {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    scheduledDate: '',
    duration: 60,
    tasks: []
  });
  const [taskInput, setTaskInput] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, coursesRes] = await Promise.all([
        sessionAPI.getCoachSessions(),
        courseAPI.getCoachCourses()
      ]);
      setSessions(sessionsRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSession) {
        await sessionAPI.updateSession(editingSession._id, formData);
      } else {
        await sessionAPI.createCourseSession(formData);
      }
      setShowForm(false);
      setEditingSession(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      courseId: session.course?._id || '',
      title: session.title,
      description: session.description || '',
      scheduledDate: session.scheduledDate ? format(new Date(session.scheduledDate), "yyyy-MM-dd'T'HH:mm") : '',
      duration: session.duration,
      tasks: session.tasks || []
    });
    setShowForm(true);
  };

  const handleDelete = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await sessionAPI.deleteSession(sessionId);
        fetchData();
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const handleAddTask = () => {
    if (taskInput.trim()) {
      setFormData({
        ...formData,
        tasks: [...formData.tasks, { title: taskInput.trim(), completed: false, dueDate: null }]
      });
      setTaskInput('');
    }
  };

  const handleRemoveTask = (index) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.filter((_, i) => i !== index)
    });
  };

  const handleToggleTask = async (sessionId, taskIndex) => {
    const session = sessions.find(s => s._id === sessionId);
    if (!session) return;

    const updatedTasks = [...session.tasks];
    updatedTasks[taskIndex].completed = !updatedTasks[taskIndex].completed;

    try {
      await sessionAPI.updateSessionTasks(sessionId, updatedTasks);
      fetchData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      courseId: '',
      title: '',
      description: '',
      scheduledDate: '',
      duration: 60,
      tasks: []
    });
    setTaskInput('');
  };

  const upcomingSessions = sessions.filter(session =>
    session.type === 'course-session' &&
    new Date(session.scheduledDate) >= new Date()
  ).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  const pastSessions = sessions.filter(session =>
    session.type === 'course-session' &&
    new Date(session.scheduledDate) < new Date()
  ).sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));

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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/coach')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Session Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Schedule and manage your course sessions
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingSession(null);
              resetForm();
            }}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            New Session
          </button>
        </div>

        {/* Session Form */}
        {showForm && (
          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-6">
              {editingSession ? 'Edit Session' : 'Create New Session'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course *
                  </label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Session Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Week 1 Review Session"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                    className="input-field"
                    min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 60})}
                    className="input-field"
                    min="15"
                    max="480"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Session agenda, objectives, and any special instructions"
                  className="input-field"
                  rows="4"
                />
              </div>

              {/* Tasks Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tasks & Preparation
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      placeholder="Add a task or preparation item"
                      className="input-field flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
                    />
                    <button
                      type="button"
                      onClick={handleAddTask}
                      className="btn-secondary px-4"
                      disabled={!taskInput.trim()}
                    >
                      Add
                    </button>
                  </div>

                  {formData.tasks.length > 0 && (
                    <div className="space-y-2">
                      {formData.tasks.map((task, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                          <span className="flex-1 text-sm">{task.title}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTask(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary">
                  {editingSession ? 'Update Session' : 'Create Session'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSession(null);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Upcoming Sessions */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary-600" />
            Upcoming Sessions ({upcomingSessions.length})
          </h2>

          {upcomingSessions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No upcoming sessions scheduled. Create your first session above.
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map(session => (
                <div key={session._id} className="border border-gray-200 dark:border-dark-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {session.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {session.course?.title} • {format(new Date(session.scheduledDate), 'EEEE, MMMM dd, yyyy • h:mm a')}
                      </p>
                      {session.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {session.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(session)}
                        className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(session._id)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {session.duration} minutes
                    </span>
                    <span className="flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" />
                      {session.participants?.length || 0} students
                    </span>
                  </div>

                  {/* Tasks */}
                  {session.tasks && session.tasks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tasks:</h4>
                      <div className="space-y-2">
                        {session.tasks.map((task, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => handleToggleTask(session._id, index)}
                              className="rounded border-gray-300 dark:border-dark-600"
                            />
                            <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              Past Sessions ({pastSessions.length})
            </h2>

            <div className="space-y-3">
              {pastSessions.slice(0, 10).map(session => (
                <div key={session._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{session.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {session.course?.title} • {format(new Date(session.scheduledDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(session)}
                    className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachSessions;