import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  CalendarIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  VideoCameraIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const clientLinks = [
    { name: 'Dashboard', href: '/student/dashboard', icon: HomeIcon },
    { name: 'Find Instructors', href: '/student/coaches', icon: UserGroupIcon },
    { name: 'My Bookings', href: '/student/bookings', icon: CalendarIcon },
    { name: 'My Courses', href: '/student/courses', icon: AcademicCapIcon },
    { name: 'Messages', href: '/student/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Progress', href: '/student/progress', icon: ChartBarIcon },
    { name: 'Settings', href: '/student/settings', icon: Cog6ToothIcon }
  ];

  const coachLinks = [
    { name: 'Dashboard', href: '/instructor/dashboard', icon: HomeIcon },
    { name: 'Sessions', href: '/instructor/sessions', icon: VideoCameraIcon },
    { name: 'Bookings', href: '/instructor/bookings', icon: CalendarIcon },
    { name: 'Courses', href: '/instructor/courses', icon: BookOpenIcon },
    { name: 'Students', href: '/instructor/clients', icon: UserGroupIcon },
    { name: 'Messages', href: '/instructor/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Earnings', href: '/instructor/earnings', icon: CreditCardIcon },
    { name: 'Settings', href: '/instructor/settings', icon: Cog6ToothIcon }
  ];

  const links = user?.role === 'coach' ? coachLinks : clientLinks;

  return (
    <aside className="w-64 bg-white dark:bg-dark-900 border-r border-gray-100 dark:border-dark-800 min-h-screen fixed left-0 top-16 overflow-y-auto">
      <div className="p-4">
        <div className="mb-6 p-4 bg-gray-50 dark:bg-dark-800 rounded-xl border border-transparent dark:border-dark-700">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-300 font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role === 'coach' ? 'Instructor' : user?.role === 'client' ? 'Student' : user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
              >
                <link.icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;