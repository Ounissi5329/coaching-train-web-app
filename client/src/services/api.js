import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data)
};

export const userAPI = {
  getCoaches: (params) => api.get('/users/coaches', { params }),
  getCoachById: (id) => api.get(`/users/coaches/${id}`),
  getClients: () => api.get('/users/clients'),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const courseAPI = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourseById: (id) => api.get(`/courses/${id}`),
  getCoachCourses: () => api.get('/courses/my-courses'),
  getEnrolledCourses: () => api.get('/courses/enrolled'),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  addLesson: (id, data) => api.post(`/courses/${id}/lessons`, data),
  enrollCourse: (id) => api.post(`/courses/${id}/enroll`),
  uploadThumbnail: (id, formData) => api.post(`/courses/${id}/thumbnail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  assignCoach: (id, coachId) => api.put(`/courses/${id}/assign-coach`, { coachId }),
  manageEnrollment: (id, clientId, action) => api.put(`/courses/${id}/manage-enrollment`, { clientId, action })
};

export const sessionAPI = {
  getSessions: (params) => api.get('/sessions', { params }),
  getSessionById: (id) => api.get(`/sessions/${id}`),
  getCoachSessions: () => api.get('/sessions/my-sessions'),
  createSession: (data) => api.post('/sessions', data),
  updateSession: (id, data) => api.put(`/sessions/${id}`, data),
  deleteSession: (id) => api.delete(`/sessions/${id}`)
};

export const bookingAPI = {
  getBookings: (params) => api.get('/bookings', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  getUpcomingBookings: () => api.get('/bookings/upcoming'),
  createBooking: (data) => api.post('/bookings', data),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
  rescheduleBooking: (id, data) => api.put(`/bookings/${id}/reschedule`, data)
};

export const messageAPI = {
  getConversations: () => api.get('/messages'),
  getConversation: (userId, params) => api.get(`/messages/${userId}`, { params }),
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (conversationId) => api.put(`/messages/${conversationId}/read`),
  getUnreadCount: () => api.get('/messages/unread')
};

export const paymentAPI = {
  createPaymentIntent: (data) => api.post('/payments/create-payment-intent', data),
  confirmPayment: (data) => api.post('/payments/confirm', data),
  createConnectAccount: () => api.post('/payments/connect-account'),
  getPaymentHistory: (params) => api.get('/payments/history', { params })
};

export const mediaAPI = {
  getMedia: () => api.get('/media'),
  uploadMedia: (formData) => api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteMedia: (id) => api.delete(`/media/${id}`)
};

export const commentAPI = {
  getComments: (courseId, lessonId) => api.get(`/comments/${courseId}${lessonId ? `?lessonId=${lessonId}` : ''}`),
  createComment: (data) => api.post('/comments', data),
  reactToComment: (id, type) => api.post(`/comments/${id}/react`, { type }),
  deleteComment: (id) => api.delete(`/comments/${id}`)
};

export default api;
