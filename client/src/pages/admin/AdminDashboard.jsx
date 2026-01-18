import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { DocumentIcon, PlusIcon, TrashIcon, BookOpenIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import MediaSelector from '../../components/course/MediaSelector';

const AdminDashboard = () => {
  const [media, setMedia] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expandedCourse, setExpandedCourse] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [mediaRes, coursesRes] = await Promise.all([
        axios.get(`${API_URL}/media`),
        axios.get(`${API_URL}/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setMedia(mediaRes.data);
      // The courses API might return an object with a courses array
      setCourses(coursesRes.data.courses || coursesRes.data);
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
    if (!file) {
      toast.error('Please select a file');
      return;
    }

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
      console.error('Error uploading file:', error);
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
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleUpdateLessonResources = async (courseId, lessonId, resources) => {
    try {
      const token = localStorage.getItem('token');
      // We need to update the specific lesson. Since there might not be a direct lesson update API,
      // we might need to update the whole course or have a specific endpoint.
      // Assuming we can update the course with the new lessons array.
      const course = courses.find(c => c._id === courseId);
      const updatedLessons = course.lessons.map(lesson => 
        lesson._id === lessonId ? { ...lesson, resources } : lesson
      );

      await axios.put(`${API_URL}/courses/${courseId}`, { lessons: updatedLessons }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Lesson resources updated');
      fetchData();
    } catch (error) {
      console.error('Error updating lesson resources:', error);
      toast.error('Failed to update resources');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Upload & Media Library */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
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
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Description (optional)"
                  rows="2"
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
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-indigo-600" />
                Media Library
              </h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {media.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No files uploaded yet.</p>
                ) : (
                  media.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500">PDF File</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeleteMedia(item._id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Course Management */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5 text-indigo-600" />
                Course Content Management
              </h2>
              
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : courses.length === 0 ? (
                <p className="text-center py-10 text-gray-500">No courses found.</p>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course._id} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedCourse(expandedCourse === course._id ? null : course._id)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                            <BookOpenIcon className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-bold text-gray-900">{course.title}</h3>
                            <p className="text-xs text-gray-500">{course.lessons?.length || 0} Lessons</p>
                          </div>
                        </div>
                        {expandedCourse === course._id ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                      </button>

                      {expandedCourse === course._id && (
                        <div className="p-4 space-y-6 bg-white">
                          {course.lessons?.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No lessons in this course.</p>
                          ) : (
                            course.lessons.map((lesson) => (
                              <div key={lesson._id} className="border-b border-gray-50 last:border-0 pb-6 last:pb-0">
                                <h4 className="font-semibold text-gray-800 mb-2">Lesson: {lesson.title}</h4>
                                <MediaSelector
                                  selectedMedia={lesson.resources || []}
                                  onSelect={(selected) => handleUpdateLessonResources(course._id, lesson._id, selected)}
                                />
                              </div>
                            ))
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
