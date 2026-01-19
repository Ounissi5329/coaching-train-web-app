import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PaymentModal from './components/payment/PaymentModal';
import CommentSection from '../components/course/CommentSection';
import {
  AcademicCapIcon,,
  ClockIcon,
  UserGroupIcon,
  PlayIcon,
  DocumentIcon,
  LockClosedIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const CourseDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await courseAPI.getCourseById(id);
        setCourse(response.data);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  const isEnrolled = user && course.enrolledStudents?.includes(user._id);
  const isCoach = user && course.coach?._id === user._id;
  const isAdmin = user && user.role === 'admin';
  const hasAccess = isEnrolled || isCoach || isAdmin;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-64 object-cover" />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <AcademicCapIcon className="w-20 h-20 text-white/50" />
                </div>
              )}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                    {course.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm capitalize">
                    {course.level}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
                <p className="text-gray-600 text-lg mb-8">{course.description}</p>

                <h2 className="text-xl font-bold text-gray-900 mb-4">Course Content</h2>
                <div className="space-y-4">
                  {course.lessons?.map((lesson, index) => (
                    <div key={lesson._id} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => hasAccess && setExpandedLesson(expandedLesson === lesson._id ? null : lesson._id)}
                        className={`w-full flex items-center justify-between p-4 transition-colors ${hasAccess ? 'hover:bg-gray-50' : 'cursor-not-allowed opacity-75'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-medium">
                            {index + 1}
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                            <p className="text-xs text-gray-500">{lesson.duration} mins</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!hasAccess && <LockClosedIcon className="w-5 h-5 text-gray-400" />}
                          {hasAccess && (expandedLesson === lesson._id ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />)}
                        </div>
                      </button>

                      {hasAccess && expandedLesson === lesson._id && (
                        <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-4">
                          {lesson.content && <p className="text-gray-700 text-sm whitespace-pre-wrap">{lesson.content}</p>}
                          
                          {/* Lesson-specific Discussion */}
                          <CommentSection courseId={course._id} lessonId={lesson._id} />
                          
                          {lesson.videoUrl && (
                            <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                              <PlayIcon className="w-5 h-5" />
                              Watch Lesson Video
                            </a>
                          )}

                          {/* PDF Resources Section */}
                          {lesson.resources && lesson.resources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <DocumentIcon className="w-4 h-4 text-indigo-600" />
                                Downloadable Resources (PDF)
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {lesson.resources.map((res, i) => (
                                  <a
                                    key={i}
                                    href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${res.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all group"
                                  >
                                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                      <DocumentIcon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium text-gray-900 truncate">{res.title}</p>
                                      <p className="text-[10px] text-gray-500">PDF Document</p>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Course-wide Discussion */}
                <CommentSection courseId={course._id} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <div className="text-3xl font-bold text-gray-900 mb-6">${course.price}</div>
              
              {!hasAccess ? (
                <button
                  onClick={() => isAuthenticated ? setIsPaymentOpen(true) : window.location.href='/login'}
                  className="w-full btn-primary py-4 text-lg mb-4"
                >
                  Enroll Now
                </button>
              ) : (
                <div className="w-full bg-green-50 text-green-700 py-4 rounded-xl text-center font-bold mb-4 border border-green-100">
                  You have access to this course
                </div>
              )}

              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                  <span>Full lifetime access</span>
                </div>
                <div className="flex items-center gap-3">
                  <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                  <span>{course.lessons?.length || 0} lessons</span>
                </div>
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="w-5 h-5 text-gray-400" />
                  <span>{course.enrolledStudents?.length || 0} students enrolled</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Your Coach</h3>
                <div className="flex items-center gap-4">
                  {course.coach?.avatar ? (
                    <img src={course.coach.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                      {course.coach?.firstName?.[0]}{course.coach?.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900">{course.coach?.firstName} {course.coach?.lastName}</p>
                    <Link to={`/coaches/${course.coach?._id}`} className="text-primary-600 hover:underline text-xs">View Profile</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        type="course"
        data={{
          courseId: course._id,
          amount: course.price,
          title: course.title
        }}
      />
    </div>
  );
};

export default CourseDetails;
