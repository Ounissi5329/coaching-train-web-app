import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Coaches from './pages/Coaches';
import CoachProfile from './pages/CoachProfile';
import Courses from './pages/Courses';

import ClientDashboard from './pages/client/ClientDashboard';
import CoachDashboard from './pages/coach/CoachDashboard';

import VideoCall from './components/video/VideoCall';

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

const DashboardLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/coaches" element={<PublicLayout><Coaches /></PublicLayout>} />
            <Route path="/coaches/:id" element={<PublicLayout><CoachProfile /></PublicLayout>} />
            <Route path="/courses" element={<PublicLayout><Courses /></PublicLayout>} />

            {/* Client Routes */}
            <Route
              path="/client/dashboard"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <DashboardLayout><ClientDashboard /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/*"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <DashboardLayout><ClientDashboard /></DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Coach Routes */}
            <Route
              path="/coach/dashboard"
              element={
                <ProtectedRoute allowedRoles={['coach']}>
                  <DashboardLayout><CoachDashboard /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/*"
              element={
                <ProtectedRoute allowedRoles={['coach']}>
                  <DashboardLayout><CoachDashboard /></DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Video Call */}
            <Route
              path="/video/:roomId"
              element={
                <ProtectedRoute>
                  <VideoCall />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
