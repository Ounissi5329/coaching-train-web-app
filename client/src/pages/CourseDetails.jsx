import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CommentSection from '../components/course/CommentSection';
import VideoPlayer from '../components/video/VideoPlayer';
import PaymentModal from '../components/payment/PaymentModal';
import {
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  PlayIcon,
  DocumentIcon,
  LockClosedIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { resolvedTheme } = useTheme();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({ overallProgress: 0, completedLessons: [] });
  const [loading, setLoading] = useState(true);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [markingProgress, setMarkingProgress] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await courseAPI.getCourseById(id);
        setCourse(courseRes.data);
        
        if (user) {
          const progressRes = await courseAPI.getCourseProgress(id);
          setProgress(progressRes.data);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleMarkCompleted = async (lessonId) => {
    if (markingProgress) return;
    setMarkingProgress(lessonId);
    try {
      const response = await courseAPI.markLessonCompleted(id, lessonId);
      setProgress(response.data);
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
    } finally {
      setMarkingProgress(null);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  const isEnrolled = user && course.enrolledStudents?.some(s => (s._id || s) === user._id);
  const isCoach = user && course.coach?._id === user._id;
  const isAdmin = user && user.role === 'admin';
  const hasAccess = isEnrolled || isCoach || isAdmin;
  const isAdminOrCoach = user && (user.role === 'admin' || user.role === 'coach');

  const isLessonCompleted = (lessonId) => {
    return progress.completedLessons?.some(cl => cl.lessonId === lessonId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden mb-8">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-64 object-cover" />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <AcademicCapIcon className="w-20 h-20 text-white/50" />
                </div>
              )}
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                      {course.category}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 rounded-full text-sm capitalize">
                      {course.level}
                    </span>
                  </div>
                  {hasAccess && (
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-600 transition-all duration-500" 
                          style={{ width: `${progress.overallProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{progress.overallProgress}%</span>
                    </div>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{course.title}</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">{course.description}</p>

                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Course Content</h2>
                <div className="space-y-4">
                  {course.lessons?.map((lesson, index) => (
                    <div key={lesson._id} className={`border rounded-xl overflow-hidden transition-colors ${isLessonCompleted(lesson._id) ? 'border-green-100 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10' : 'border-gray-100 dark:border-dark-700'}`}>
                      <div className="flex items-center">
                        <button
                          onClick={() => hasAccess && setExpandedLesson(expandedLesson === lesson._id ? null : lesson._id)}
                          className={`flex-1 flex items-center justify-between p-4 transition-colors ${hasAccess ? 'hover:bg-gray-50 dark:hover:bg-dark-700' : 'cursor-not-allowed opacity-75'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${isLessonCompleted(lesson._id) ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-dark-700 text-gray-500 dark:text-gray-400'}`}>
                              {isLessonCompleted(lesson._id) ? <CheckCircleSolid className="w-5 h-5" /> : index + 1}
                            </div>
                            <div className="text-left">
                              <h3 className={`font-semibold ${isLessonCompleted(lesson._id) ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-gray-100'}`}>{lesson.title}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{lesson.duration} mins</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!hasAccess && <LockClosedIcon className="w-5 h-5 text-gray-400" />}
                            {hasAccess && (expandedLesson === lesson._id ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />)}
                          </div>
                        </button>
                        {hasAccess && (
                          <div className="pr-4">
                            <button
                              onClick={() => handleMarkCompleted(lesson._id)}
                              disabled={markingProgress === lesson._id || isLessonCompleted(lesson._id)}
                              className={`p-2 rounded-full transition-colors ${
                                isLessonCompleted(lesson._id) 
                                  ? 'text-green-600 dark:text-green-400 cursor-default' 
                                  : 'text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30'
                              }`}
                              title={isLessonCompleted(lesson._id) ? "Completed" : "Mark as completed"}
                            >
                              {isLessonCompleted(lesson._id) ? (
                                <CheckCircleSolid className="w-6 h-6" />
                              ) : (
                                <CheckCircleIcon className={`w-6 h-6 ${markingProgress === lesson._id ? 'animate-pulse' : ''}`} />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {hasAccess && expandedLesson === lesson._id && (
                        <div className="p-4 bg-white dark:bg-dark-800 border-t border-gray-100 dark:border-dark-700 space-y-4">
                          {lesson.content && <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{lesson.content}</p>}
                          
                          {lesson.videoUrl && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <PlayIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                Lesson Video
                              </h4>
                              <VideoPlayer url={lesson.videoUrl} title={lesson.title} />
                            </div>
                          )}

                          {lesson.notes && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <DocumentIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                Lesson Notes
                              </h4>
                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div
                                  className="text-gray-700 dark:text-gray-300 text-sm lesson-notes"
                                  dangerouslySetInnerHTML={{ __html: lesson.notes }}
                                />
                              </div>
                            </div>
                          )}

                          {lesson.resources && lesson.resources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-600">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                                <DocumentIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                Downloadable Resources (PDF)
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {lesson.resources.map((res, i) => (
                                  <button
                                    key={i}
                                    onClick={() => {
                                      const pdfUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${res.fileUrl}`;
                                      navigate(`/pdf?title=${encodeURIComponent(res.title)}&url=${encodeURIComponent(pdfUrl)}`);
                                    }}
                                    className="flex items-center gap-3 p-3 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-sm transition-all group text-left w-full"
                                  >
                                    <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded flex items-center justify-center group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                      <DocumentIcon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{res.title}</p>
                                      <p className="text-[10px] text-gray-500 dark:text-gray-400">View PDF Document</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-dark-700">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">Lesson Discussion</h4>
                            <CommentSection courseId={course._id} lessonId={lesson._id} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 p-6 sticky top-8">
              {isAdminOrCoach ? (
                <div className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 py-4 rounded-xl text-center font-bold mb-4 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Admin/Coach Access
                  </div>
                  <p className="text-sm mt-1 opacity-75">You have full access to this course</p>
                </div>
              ) : !hasAccess ? (
                <div className="mb-4">
                  <div className="text-center mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {course.price > 0 ? `$${course.price}` : 'Free'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        window.location.href='/login';
                      } else if (course.price > 0) {
                        setPaymentModalOpen(true);
                      } else {
                        setEnrolling(true);
                        courseAPI.enrollCourse(course._id)
                          .then(() => {
                            window.location.reload();
                          })
                          .catch(err => {
                            console.error(err);
                            alert('Failed to enroll');
                            setEnrolling(false);
                          });
                      }
                    }}
                    disabled={enrolling}
                    className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Enrolling...
                      </div>
                    ) : (
                      course.price > 0 ? `Buy Course - $${course.price}` : 'Enroll for Free'
                    )}
                  </button>
                </div>
              ) : (
                <div className="w-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 py-4 rounded-xl text-center font-bold mb-4 border border-green-100 dark:border-green-800">
                  You have access to this course
                </div>
              )}

              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span>Full lifetime access</span>
                </div>
                <div className="flex items-center gap-3">
                  <AcademicCapIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span>{course.lessons?.length || 0} lessons</span>
                </div>
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span>{course.enrolledStudents?.length || 0} students enrolled</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-dark-700">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Your Coach</h3>
                <div className="flex items-center gap-4">
                  {course.coach?.avatar ? (
                    <img src={course.coach.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 dark:bg-dark-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold">
                      {course.coach?.firstName?.[0]}{course.coach?.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{course.coach?.firstName} {course.coach?.lastName}</p>
                    <Link to={`/coaches/${course.coach?._id}`} className="text-primary-600 dark:text-primary-400 hover:underline text-xs">View Profile</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        data={{
          courseId: course._id,
          title: course.title,
          amount: course.price
        }}
        type="course"
      />
    </div>
  );
};

export default CourseDetails;
