import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, sessionAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  StarIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { format, addDays } from 'date-fns';

const CoachProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [coach, setCoach] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coachRes, sessionsRes] = await Promise.all([
          userAPI.getCoachById(id),
          sessionAPI.getSessions({ coach: id })
        ]);
        setCoach(coachRes.data);
        setSessions(sessionsRes.data.sessions);
      } catch (error) {
        console.error('Error fetching coach:', error);
        toast.error('Coach not found');
        navigate('/coaches');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const generateDates = () => {
    const dates = [];
    for (let i = 1; i <= 14; i++) {
      dates.push(addDays(new Date(), i));
    }
    return dates;
  };

  const handleBookSession = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a session');
      navigate('/login', { state: { from: `/coaches/${id}` } });
      return;
    }

    if (!selectedSession || !selectedDate || !selectedTime) {
      toast.error('Please select a session, date, and time');
      return;
    }

    setBookingLoading(true);
    try {
      const duration = selectedSession.duration;
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const endHours = Math.floor((hours * 60 + minutes + duration) / 60);
      const endMinutes = (hours * 60 + minutes + duration) % 60;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

      await bookingAPI.createBooking({
        sessionId: selectedSession._id,
        scheduledDate: selectedDate,
        startTime: selectedTime,
        endTime: endTime
      });

      toast.success('Booking created successfully!');
      setShowBookingModal(false);
      navigate('/client/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <LoadingSpinner size="lg" className="mt-20" />
      </div>
    );
  }

  if (!coach) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="card">
              <div className="flex flex-col md:flex-row gap-6">
                {coach.avatar ? (
                  <img
                    src={coach.avatar}
                    alt={`${coach.firstName} ${coach.lastName}`}
                    className="w-32 h-32 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-4xl">
                      {coach.firstName?.[0]}{coach.lastName?.[0]}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {coach.firstName} {coach.lastName}
                  </h1>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      i < 4 ? (
                        <StarSolid key={i} className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <StarIcon key={i} className="w-5 h-5 text-gray-300" />
                      )
                    ))}
                    <span className="text-gray-600 ml-2">4.8 (124 reviews)</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(coach.specializations || ['Life Coaching']).map((spec, i) => (
                      <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed">
                {coach.bio || 'Experienced coach dedicated to helping clients achieve their personal and professional goals. With years of experience in coaching and mentorship, I provide personalized guidance tailored to your unique needs and aspirations.'}
              </p>
            </div>

            {/* Sessions */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Sessions</h2>
              {sessions.length === 0 ? (
                <p className="text-gray-500">No sessions available at the moment.</p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session._id}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedSession?._id === session._id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{session.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{session.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {session.duration} min
                            </span>
                            <span className="capitalize">{session.type}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">${session.price}</p>
                          {selectedSession?._id === session._id && (
                            <CheckCircleIcon className="w-6 h-6 text-primary-600 ml-auto mt-2" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Booking */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-gray-900">${coach.hourlyRate || 75}</p>
                <p className="text-gray-500">per hour</p>
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                disabled={sessions.length === 0}
              >
                <CalendarIcon className="w-5 h-5" />
                Book a Session
              </button>

              <button className="w-full btn-secondary py-3 mt-3 flex items-center justify-center gap-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                Send Message
              </button>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="font-medium text-gray-900 mb-3">Availability</h3>
                <div className="space-y-2 text-sm">
                  {(coach.availability || [
                    { day: 'monday', startTime: '09:00', endTime: '17:00' },
                    { day: 'wednesday', startTime: '09:00', endTime: '17:00' },
                    { day: 'friday', startTime: '09:00', endTime: '17:00' }
                  ]).map((slot, i) => (
                    <div key={i} className="flex justify-between text-gray-600">
                      <span className="capitalize">{slot.day}</span>
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Book a Session</h2>

              {/* Session Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Session Type
                </label>
                <select
                  value={selectedSession?._id || ''}
                  onChange={(e) => setSelectedSession(sessions.find(s => s._id === e.target.value))}
                  className="input-field"
                >
                  <option value="">Choose a session...</option>
                  {sessions.map((session) => (
                    <option key={session._id} value={session._id}>
                      {session.title} - ${session.price} ({session.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {generateDates().slice(0, 8).map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date.toISOString())}
                      className={`p-2 rounded-lg text-center transition-colors ${
                        selectedDate === date.toISOString()
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="text-xs">{format(date, 'EEE')}</div>
                      <div className="font-semibold">{format(date, 'd')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                  {generateTimeSlots().map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded-lg text-center transition-colors ${
                        selectedTime === time
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {selectedSession && selectedDate && selectedTime && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-medium text-gray-900 mb-2">Booking Summary</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Session:</span> {selectedSession.title}</p>
                    <p><span className="font-medium">Date:</span> {format(new Date(selectedDate), 'MMMM d, yyyy')}</p>
                    <p><span className="font-medium">Time:</span> {selectedTime}</p>
                    <p><span className="font-medium">Duration:</span> {selectedSession.duration} minutes</p>
                    <p className="text-lg font-bold text-gray-900 mt-2">Total: ${selectedSession.price}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 btn-secondary py-3"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookSession}
                  disabled={!selectedSession || !selectedDate || !selectedTime || bookingLoading}
                  className="flex-1 btn-primary py-3"
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachProfile;
