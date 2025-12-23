import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  VideoCameraIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: CalendarIcon,
    title: 'Easy Scheduling',
    description: 'Book sessions with coaches based on their availability. Manage your calendar effortlessly.'
  },
  {
    icon: VideoCameraIcon,
    title: 'Video Sessions',
    description: 'Connect face-to-face with your coach through high-quality video calls.'
  },
  {
    icon: AcademicCapIcon,
    title: 'Online Courses',
    description: 'Access comprehensive courses created by expert coaches at your own pace.'
  },
  {
    icon: ChartBarIcon,
    title: 'Track Progress',
    description: 'Monitor your journey with detailed progress tracking and achievements.'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Business Professional',
    content: 'CoachHub transformed my career. My coach helped me develop leadership skills I never knew I had.',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
  },
  {
    name: 'Michael Chen',
    role: 'Entrepreneur',
    content: 'The platform is intuitive and the coaches are world-class. Highly recommended!',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
  },
  {
    name: 'Emily Davis',
    role: 'Fitness Enthusiast',
    content: 'Found an amazing fitness coach who keeps me accountable. Best investment in myself!',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg'
  }
];

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Transform Your Life with Expert Coaching
              </h1>
              <p className="mt-6 text-lg text-primary-100">
                Connect with certified coaches who can help you achieve your personal and professional goals. 
                Book sessions, access courses, and track your progress all in one place.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/register" className="px-6 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                  Get Started Free
                </Link>
                <Link to="/coaches" className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  Browse Coaches
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-primary-100">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>1000+ Expert Coaches</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>50,000+ Sessions</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-white/10 rounded-2xl blur-xl"></div>
                <img
                  src="https://images.unsplash.com/photo-1552581234-26160f608093?w=600"
                  alt="Coaching session"
                  className="relative rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need to Succeed</h2>
            <p className="mt-4 text-lg text-gray-600">
              Our platform provides all the tools for effective coaching and learning
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Getting started is simple
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Your Coach</h3>
              <p className="text-gray-600">Browse our network of certified coaches and find the perfect match for your goals.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Book a Session</h3>
              <p className="text-gray-600">Schedule sessions at times that work for you. Pay securely online.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Achieve Your Goals</h3>
              <p className="text-gray-600">Work with your coach to reach your full potential. Track your progress along the way.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">What Our Users Say</h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of satisfied clients
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Start Your Journey?</h2>
          <p className="mt-4 text-lg text-primary-100">
            Join thousands of people who are achieving their goals with CoachHub
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="px-8 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
              Get Started Free
            </Link>
            <Link to="/become-coach" className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Become a Coach
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
