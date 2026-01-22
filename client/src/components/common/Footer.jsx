import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const Footer = () => {

  return (
    <footer className="bg-secondary-900 text-gray-300 border-t border-secondary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-sm shadow-primary-900/30">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-white">CourseLearn</span>
            </div>
            <p className="text-sm text-gray-400">
              Connect with expert instructors to achieve your personal and professional goals.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/coaches" className="text-sm hover:text-white">Find Instructors</Link></li>
              <li><Link to="/courses" className="text-sm hover:text-white">Browse Courses</Link></li>
              {/* <li><Link to="/pricing" className="text-sm hover:text-white">Pricing</Link></li> */}
              <li><Link to="/become-coach" className="text-sm hover:text-white">Become an Instructor</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-sm hover:text-white">Help Center</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-white">Contact Us</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-white">Live Chat</Link></li>
              <li><Link to="/faq" className="text-sm hover:text-white">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} CourseLearn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;