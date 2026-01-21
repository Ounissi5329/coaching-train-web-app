import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { 
  DocumentIcon, 
  PlusIcon, 
  TrashIcon, 
  BookOpenIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  UserIcon,
  UserGroupIcon,
  UserPlusIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';
import MediaSelector from '../../components/course/MediaSelector';
import RichTextEditor from '../../components/common/RichTextEditor';
import { courseAPI, userAPI } from '../../services/api';

const AdminDashboard = () => {
  const { resolvedTheme } = useTheme();
  const [media, setMedia] = useState([]);
  const [courses, setCourses] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [showClientManager, setShowClientManager] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content: '',
    videoUrl: '',
    duration: 0
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mediaRes, coursesRes, coachesRes, clientsRes] = await Promise.all([
        axios.get(`${API_URL}/media`),
        courseAPI.getCourses(),
        userAPI.getCoaches({ limit: 100 }),
        userAPI.getClients()
      ]);
      setMedia(mediaRes.data);
      setCourses(coursesRes.data.courses || coursesRes.data);
      setCoaches(coachesRes.data.coaches || coachesRes.data);
      setClients(clientsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a PDF file');
      e.target.value = null;
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');

    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', title);
    formData.append('description', description);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/media/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('File uploaded successfully');
      setFile(null);
      setTitle('');
      setDescription('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/media/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('File deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleAssignCoach = async (courseId, coachId) => {
    try {
      await courseAPI.assignCoach(courseId, coachId);
      toast.success('Coach assigned successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to assign coach');
    }
  };

  const handleManageEnrollment = async (courseId, clientId, action) => {
    try {
      await courseAPI.manageEnrollment(courseId, clientId, action);
toast.success(action === 'add' ? 'Student enrolled' : 'Student unenrolled');
      fetchData();
    } catch (error) {
      toast.error('Failed to update enrollment');
    }
  };

  const handleUpdateLessonResources = async (courseId, lessonId, resources) => {
    try {
      const course = courses.find(c => c._id === courseId);
      const updatedLessons = course.lessons.map(lesson => 
        lesson._id === lessonId ? { ...lesson, resources } : lesson
      );
      await courseAPI.updateCourse(courseId, { lessons: updatedLessons });
      toast.success('Lesson resources updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update resources');
    }
  };

  const handleAddLesson = async (courseId) => {
    if (!lessonForm.title || lessonForm.title.trim() === '') {
      toast.error('Lesson title is required');
      return;
    }

    if (lessonForm.duration <= 0) {
      toast.error('Lesson duration must be greater than 0');
      return;
    }

    setUploading(true);
    try {
      await courseAPI.addLesson(courseId, lessonForm);
      toast.success('Lesson added successfully');
      setLessonForm({ title: '', description: '', content: '', notes: '', videoUrl: '', duration: 0 });
      setEditingLesson(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add lesson');
    } finally {
      setUploading(false);
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson._id);
    setLessonForm({
      title: lesson.title || '',
      description: lesson.description || '',
      content: lesson.content || '',
      notes: lesson.notes || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || 0
    });
  };

  const handleUpdateLesson = async (courseId, lessonId) => {
    if (!lessonForm.title || lessonForm.title.trim() === '') {
      toast.error('Lesson title is required');
      return;
    }

    if (lessonForm.duration <= 0) {
      toast.error('Lesson duration must be greater than 0');
      return;
    }

    setUploading(true);
    try {
      const course = courses.find(c => c._id === courseId);
      const updatedLessons = course.lessons.map(lesson => 
        lesson._id === lessonId ? { ...lesson, ...lessonForm } : lesson
      );
      await courseAPI.updateCourse(courseId, { lessons: updatedLessons });
      toast.success('Lesson updated successfully');
      setEditingLesson(null);
      setLessonForm({ title: '', description: '', content: '', notes: '', videoUrl: '', duration: 0 });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update lesson');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingLesson(null);
    setLessonForm({ title: '', description: '', content: '', notes: '', videoUrl: '', duration: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Admin Dashboard</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Column: Media & Upload */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <PlusIcon className="w-5 h-5 text-indigo-600" />
                Upload PDF
              </h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-dark-700 rounded-lg text-sm bg-white dark:bg-dark-900 text-gray-900 dark:text-gray-100"
                  placeholder="File Title"
                  required
                />
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full text-xs text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800/30"
                  required
                />
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-dark-700 transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload to Library'}
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <DocumentIcon className="w-5 h-5 text-indigo-600" />
                Media Library
              </h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {media.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-xl group">
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate flex-1">{item.title}</p>
                    <button onClick={() => handleDeleteMedia(item._id)} className="p-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Course Management */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <BookOpenIcon className="w-5 h-5 text-indigo-600" />
                Course & Student Management
              </h2>
              
              {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
              ) : (
                <div className="space-y-6">
                  {courses.map((course) => (
                    <div key={course._id} className="border border-gray-100 dark:border-dark-700 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-gray-50 dark:bg-dark-700 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <BookOpenIcon className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">{course.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{course.lessons?.length || 0} Lessons • {course.enrolledStudents?.length || 0} Students</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-white dark:bg-dark-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-600">
                            <UserIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <select 
                              value={course.coach?._id || course.coach} 
                              onChange={(e) => handleAssignCoach(course._id, e.target.value)}
                              className="text-xs font-medium select-dark focus:outline-none"
                            >
<option value="">Assign Instructor</option>
                              {coaches.map(coach => (
                                <option key={coach._id} value={coach._id}>{coach.firstName} {coach.lastName}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => setExpandedCourse(expandedCourse === course._id ? null : course._id)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
                          >
                            {expandedCourse === course._id ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {expandedCourse === course._id && (
                        <div className="p-6 bg-white dark:bg-dark-800 border-t border-gray-100 dark:border-dark-700">
                          <div className="flex border-b border-gray-100 dark:border-dark-700 mb-6">
                            <button 
                              onClick={() => setShowClientManager(false)}
                              className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${!showClientManager ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
                            >
                              Lessons & Media
                            </button>
                            <button 
                              onClick={() => setShowClientManager(true)}
                              className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${showClientManager ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
                            >
                              Student Access
                            </button>
                          </div>

                          {!showClientManager ? (
                            <div className="space-y-6">
                              <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Lessons</h3>
                                <button
                                  onClick={() => setEditingLesson('new')}
                                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                >
                                  <PlusIcon className="w-4 h-4" />
                                  Add Lesson
                                </button>
                              </div>

                              {editingLesson === 'new' && (
                                <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-xl border border-gray-200 dark:border-dark-600">
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Add New Lesson</h4>
                                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <input
                                      type="text"
                                      placeholder="Lesson Title"
                                      value={lessonForm.title}
                                      onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                                      className="p-2 border border-gray-300 dark:border-dark-600 rounded-lg text-sm bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100"
                                      required
                                    />
                                    <input
                                      type="number"
                                      placeholder="Duration (minutes)"
                                      value={lessonForm.duration}
                                      onChange={(e) => setLessonForm({...lessonForm, duration: parseInt(e.target.value) || 0})}
                                      className="p-2 border border-gray-300 dark:border-dark-600 rounded-lg text-sm bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100"
                                    />
                                  </div>
                                  <input
                                    type="url"
                                    placeholder="Video URL (YouTube, Vimeo, or direct video link)"
                                    value={lessonForm.videoUrl}
                                    onChange={(e) => setLessonForm({...lessonForm, videoUrl: e.target.value})}
                                    className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg text-sm bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 mb-4"
                                  />
                                  <textarea
                                    placeholder="Lesson Description"
                                    value={lessonForm.description}
                                    onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})}
                                    className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg text-sm bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 mb-4"
                                    rows="2"
                                  />
                                  <textarea
                                    placeholder="Lesson Content"
                                    value={lessonForm.content}
                                    onChange={(e) => setLessonForm({...lessonForm, content: e.target.value})}
                                    className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg text-sm bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 mb-4"
                                    rows="3"
                                  />
                                  <div className="mb-4">
                                    <RichTextEditor
                                      value={lessonForm.notes}
                                      onChange={(value) => setLessonForm({...lessonForm, notes: value})}
                                      placeholder="Add notes, tips, or paste images..."
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleAddLesson(course._id)}
                                      disabled={uploading}
                                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
                                    >
                                      {uploading ? 'Adding...' : 'Add Lesson'}
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}

                              {course.lessons?.map((lesson) => (
                                <div key={lesson._id} className="pb-6 border-b border-gray-50 dark:border-dark-700 last:border-0 last:pb-0">
                                  {editingLesson === lesson._id ? (
                                    <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-xl border border-gray-200 dark:border-dark-600">
                                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Edit Lesson</h4>
                                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <input
                                          type="text"
                                          placeholder="Lesson Title"
                                          value={lessonForm.title}
                                          onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                                          className="p-2 border border-gray-300 dark:border-dark-600 rounded-lg text-sm bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100"
                                          required
                                        />
                                        <input
                                          type="number"
                                          placeholder="Duration (minutes)"
                                          value={lessonForm.duration}
                                          onChange={(e) => setLessonForm({...lessonForm, duration: parseInt(e.target.value) || 0})}
                                          className="p-2 border border-gray-300 dark:border-dark-600 rounded-lg text-sm bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100"
                                        />
                                      </div>
                                      <input
                                        type="url"
                                        placeholder="Video URL (YouTube, Vimeo, or direct video link)"
                                        value={lessonForm.videoUrl}
                                        onChange={(e) => setLessonForm({...lessonForm, videoUrl: e.target.value})}
                                        className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg text-sm bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 mb-4"
                                      />
                                      <textarea
                                        placeholder="Lesson Description"
                                        value={lessonForm.description}
                                        onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})}
                                        className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg text-sm bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 mb-4"
                                        rows="2"
                                      />
                                      <textarea
                                        placeholder="Lesson Content"
                                        value={lessonForm.content}
                                        onChange={(e) => setLessonForm({...lessonForm, content: e.target.value})}
                                        className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg text-sm bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 mb-4"
                                        rows="3"
                                      />
                                      <div className="mb-4">
                                        <RichTextEditor
                                          value={lessonForm.notes}
                                          onChange={(value) => setLessonForm({...lessonForm, notes: value})}
                                          placeholder="Add notes, tips, or paste images..."
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleUpdateLesson(course._id, lesson._id)}
                                          disabled={uploading}
                                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
                                        >
                                          {uploading ? 'Updating...' : 'Update Lesson'}
                                        </button>
                                        <button
                                          onClick={handleCancelEdit}
                                          className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">{lesson.title}</h4>
                                        <button
                                          onClick={() => handleEditLesson(lesson)}
                                          className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors"
                                        >
                                          Edit
                                        </button>
                                      </div>
                                      {lesson.videoUrl && (
                                        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Video URL:</p>
                                          <p className="text-xs text-blue-600 dark:text-blue-400 break-all">{lesson.videoUrl}</p>
                                        </div>
                                      )}
                                      <MediaSelector
                                        selectedMedia={lesson.resources || []}
                                        onSelect={(selected) => handleUpdateLessonResources(course._id, lesson._id, selected)}
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid md:grid-cols-2 gap-8">
                              <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                  <UserGroupIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                  Enrolled Students
                                </h4>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                  {course.enrolledStudents?.length === 0 ? (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">No students enrolled yet.</p>
                                  ) : (
                                    course.enrolledStudents.map((studentId) => {
                                      const student = clients.find(c => c._id === (studentId._id || studentId));
                                      return student ? (
                                        <div key={student._id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center text-green-700 dark:text-green-300 text-xs font-bold">
                                              {student.firstName[0]}
                                            </div>
                                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{student.firstName} {student.lastName}</span>
                                          </div>
                                          <button 
                                            onClick={() => handleManageEnrollment(course._id, student._id, 'remove')}
                                            className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                          >
                                            <UserMinusIcon className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ) : null;
                                    })
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                  <UserPlusIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                  Available Students
                                </h4>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                  {clients
                                    .filter(c => !course.enrolledStudents.some(s => (s._id || s) === c._id))
                                    .map((client) => (
                                      <div key={client._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-xl border border-gray-100 dark:border-dark-600">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-gray-200 dark:bg-dark-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-bold">
                                            {client.firstName[0]}
                                          </div>
                                          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{client.firstName} {client.lastName}</span>
                                        </div>
                                        <button 
                                          onClick={() => handleManageEnrollment(course._id, client._id, 'add')}
                                          className="p-1.5 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                        >
                                          <UserPlusIcon className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
