import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
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
import { courseAPI, userAPI } from '../../services/api';

const AdminDashboard = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Column: Media & Upload */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <PlusIcon className="w-5 h-5 text-indigo-600" />
                Upload PDF
              </h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="File Title"
                  required
                />
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  required
                />
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload to Library'}
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-indigo-600" />
                Media Library
              </h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {media.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group">
                    <p className="text-xs font-medium text-gray-900 truncate flex-1">{item.title}</p>
                    <button onClick={() => handleDeleteMedia(item._id)} className="p-1 text-red-500 opacity-0 group-hover:opacity-100">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Course Management */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5 text-indigo-600" />
                Course & Student Management
              </h2>
              
              {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
              ) : (
                <div className="space-y-6">
                  {courses.map((course) => (
                    <div key={course._id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-gray-50 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                            <BookOpenIcon className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{course.title}</h3>
                            <p className="text-xs text-gray-500">{course.lessons?.length || 0} Lessons • {course.enrolledStudents?.length || 0} Students</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                            <UserIcon className="w-4 h-4 text-gray-400" />
                            <select 
                              value={course.coach?._id || course.coach} 
                              onChange={(e) => handleAssignCoach(course._id, e.target.value)}
                              className="text-xs font-medium bg-transparent focus:outline-none"
                            >
<option value="">Assign Instructor</option>
                              {coaches.map(coach => (
                                <option key={coach._id} value={coach._id}>{coach.firstName} {coach.lastName}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => setExpandedCourse(expandedCourse === course._id ? null : course._id)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            {expandedCourse === course._id ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {expandedCourse === course._id && (
                        <div className="p-6 bg-white border-t border-gray-100">
                          <div className="flex border-b border-gray-100 mb-6">
                            <button 
                              onClick={() => setShowClientManager(false)}
                              className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${!showClientManager ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}
                            >
                              Lessons & Media
                            </button>
                            <button 
                              onClick={() => setShowClientManager(true)}
                              className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${showClientManager ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}
                            >
                              Student Access
                            </button>
                          </div>

                          {!showClientManager ? (
                            <div className="space-y-6">
                              {course.lessons?.map((lesson) => (
                                <div key={lesson._id} className="pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                  <h4 className="font-semibold text-gray-800 mb-3">Lesson: {lesson.title}</h4>
                                  <MediaSelector
                                    selectedMedia={lesson.resources || []}
                                    onSelect={(selected) => handleUpdateLessonResources(course._id, lesson._id, selected)}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid md:grid-cols-2 gap-8">
                              <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <UserGroupIcon className="w-4 h-4 text-indigo-600" />
                                  Enrolled Students
                                </h4>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                  {course.enrolledStudents?.length === 0 ? (
                                    <p className="text-xs text-gray-500 italic">No students enrolled yet.</p>
                                  ) : (
                                    course.enrolledStudents.map((studentId) => {
                                      const student = clients.find(c => c._id === (studentId._id || studentId));
                                      return student ? (
                                        <div key={student._id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-green-700 text-xs font-bold">
                                              {student.firstName[0]}
                                            </div>
                                            <span className="text-xs font-medium text-gray-900">{student.firstName} {student.lastName}</span>
                                          </div>
                                          <button 
                                            onClick={() => handleManageEnrollment(course._id, student._id, 'remove')}
                                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
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
                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <UserPlusIcon className="w-4 h-4 text-indigo-600" />
                                  Available Students
                                </h4>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                  {clients
                                    .filter(c => !course.enrolledStudents.some(s => (s._id || s) === c._id))
                                    .map((client) => (
                                      <div key={client._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">
                                            {client.firstName[0]}
                                          </div>
                                          <span className="text-xs font-medium text-gray-900">{client.firstName} {client.lastName}</span>
                                        </div>
                                        <button 
                                          onClick={() => handleManageEnrollment(course._id, client._id, 'add')}
                                          className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
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
