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
    { name: 'Dashboard', href: '/client/dashboard', icon: HomeIcon },
    { name: 'Find Coaches', href: '/client/coaches', icon: UserGroupIcon },
    { name: 'My Bookings', href: '/client/bookings', icon: CalendarIcon },
    { name: 'My Courses', href: '/client/courses', icon: AcademicCapIcon },
    { name: 'Messages', href: '/client/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Progress', href: '/client/progress', icon: ChartBarIcon },
    { name: 'Settings', href: '/client/settings', icon: Cog6ToothIcon }
  ];

  const coachLinks = [
    { name: 'Dashboard', href: '/coach/dashboard', icon: HomeIcon },
    { name: 'Sessions', href: '/coach/sessions', icon: VideoCameraIcon },
    { name: 'Bookings', href: '/coach/bookings', icon: CalendarIcon },
    { name: 'Courses', href: '/coach/courses', icon: BookOpenIcon },
    { name: 'Clients', href: '/coach/clients', icon: UserGroupIcon },
    { name: 'Messages', href: '/coach/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Earnings', href: '/coach/earnings', icon: CreditCardIcon },
    { name: 'Settings', href: '/coach/settings', icon: Cog6ToothIcon }
  ];

  const links = user?.role === 'coach' ? coachLinks : clientLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen fixed left-0 top-16 overflow-y-auto">
      <div className="p-4">
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
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
