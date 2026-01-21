import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-menu') && !event.target.closest('.profile-button')) {
        setProfileMenuOpen(false);
      }
      if (!event.target.closest('.theme-menu') && !event.target.closest('.theme-button')) {
        setThemeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (user?.role === 'coach') return '/instructor/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/student/dashboard';
  };

  return (
    <nav className="bg-white/90 dark:bg-dark-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-dark-900/60 shadow-sm border-b border-gray-100 dark:border-dark-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-sm shadow-primary-900/30">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">CourseLearn</span>
            </Link>

            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/coaches" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium">
                Find Instructors
              </Link>
              <Link to="/courses" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium">
                Courses
              </Link>
{/* <Link to="/pricing" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Pricing
              </Link> */}
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:gap-4">
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 flex items-center gap-2 theme-button"
                aria-label="Theme selector"
              >
                {resolvedTheme === 'dark' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                <span className="text-sm font-medium capitalize">{resolvedTheme}</span>
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-100 dark:border-dark-700 py-1 theme-menu">
                  <button
                    onClick={() => { setTheme('light'); setThemeMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-700 ${
                      resolvedTheme === 'light' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <SunIcon className="w-4 h-4" />
                    Light
                  </button>
                  <button
                    onClick={() => { setTheme('dark'); setThemeMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-700 ${
                      resolvedTheme === 'dark' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <MoonIcon className="w-4 h-4" />
                    Dark
                  </button>
                </div>
              )}
            </div>
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 profile-button"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.firstName}</span>
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-100 dark:border-dark-700 py-1 profile-menu">
                    <Link
                      to={getDashboardLink()}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-700"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-700"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-dark-700 flex items-center gap-2"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 text-sm font-medium">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-dark-800 border-t border-gray-100 dark:border-dark-700">
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="relative">
                <button
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 flex items-center gap-2 theme-button"
                  aria-label="Theme selector"
                >
                  {resolvedTheme === 'dark' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                  <span className="text-sm font-medium capitalize">{theme === 'system' ? 'System' : resolvedTheme}</span>
                </button>

                {themeMenuOpen && (
                  <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-100 dark:border-dark-700 py-1 theme-menu">
                    <button
                      onClick={() => { setTheme('light'); setThemeMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-700 ${
                        resolvedTheme === 'light' && theme !== 'system' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <SunIcon className="w-4 h-4" />
                      Light
                    </button>
                    <button
                      onClick={() => { setTheme('dark'); setThemeMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-700 ${
                        resolvedTheme === 'dark' && theme !== 'system' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <MoonIcon className="w-4 h-4" />
                      Dark
                    </button>
                    <button
                      onClick={() => { setTheme('system'); setThemeMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-700 ${
                        theme === 'system' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <ComputerDesktopIcon className="w-4 h-4" />
                      System
                    </button>
                  </div>
                )}
              </div>
            </div>
            <Link to="/coaches" className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-secondary-800 rounded-lg">
                Find Instructors
            </Link>
            <Link to="/courses" className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-secondary-800 rounded-lg">
              Courses
            </Link>
{/* <Link to="/pricing" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
              Pricing
            </Link> */}
            <hr className="my-2" />
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-secondary-800 rounded-lg">
                  Sign in
                </Link>
                <Link to="/register" className="block px-3 py-2 btn-primary text-center">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
