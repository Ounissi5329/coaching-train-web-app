// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider } from './context/AuthContext';
// import { ThemeProvider } from './context/ThemeContext';

// import Navbar from './components/common/Navbar';
// import CountdownTimer from './components/common/CountdownTimer';
// import ChatWidget from './components/chat/ChatWidget';
// import Footer from './components/common/Footer';
// import ProtectedRoute from './components/common/ProtectedRoute';

// import Home from './pages/Home';
// import Login from './pages/auth/Login';
// import Register from './pages/auth/Register';
// import Coaches from './pages/Coaches';
// import CoachProfile from './pages/CoachProfile';
// import Courses from './pages/Courses';
// import CourseDetails from './pages/CourseDetails';
// import PDFPage from './pages/PDFPage';

// import ClientDashboard from './pages/client/ClientDashboard';
// import CoachDashboard from './pages/coach/CoachDashboard';
// import CoachSessions from './pages/coach/CoachSessions';
// import AdminDashboard from './pages/admin/AdminDashboard';

// import VideoCall from './components/video/VideoCall';

// const PublicLayout = ({ children }) => (
//   <>
//     <Navbar />
//     <CountdownTimer />
//     {children}
//     <ChatWidget />
//     <Footer />
//   </>
// );

// const DashboardLayout = ({ children }) => (
//   <>
//     <Navbar />
//     <CountdownTimer />
//     {children}
//     <ChatWidget />
//   </>
// );

// function App() {
//   return (
//     <AuthProvider>
//       <ThemeProvider>
//         <Router>
//           <div className="min-h-screen flex flex-col">
//             <Routes>
//             {/* Public Routes */}
//             <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/coaches" element={<PublicLayout><Coaches /></PublicLayout>} />
//             <Route path="/coaches/:id" element={<PublicLayout><CoachProfile /></PublicLayout>} />
//             <Route path="/courses" element={<PublicLayout><Courses /></PublicLayout>} />
//             <Route path="/courses/:id" element={<PublicLayout><CourseDetails /></PublicLayout>} />
//             <Route path="/pdf" element={<PublicLayout><PDFPage /></PublicLayout>} />

//             {/* Student Routes */}
//             <Route
//               path="/student/dashboard"
//               element={
//                 <ProtectedRoute allowedRoles={['client']}>
//                   <DashboardLayout><ClientDashboard /></DashboardLayout>
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/student/*"
//               element={
//                 <ProtectedRoute allowedRoles={['client']}>
//                   <DashboardLayout><ClientDashboard /></DashboardLayout>
//                 </ProtectedRoute>
//               }
//             />

//             {/* Instructor Routes */}
//             <Route
//               path="/coach/sessions/new"
//               element={
//                 <ProtectedRoute allowedRoles={['coach']}>
//                   <DashboardLayout><CoachSessions /></DashboardLayout>
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/instructor/dashboard"
//               element={
//                 <ProtectedRoute allowedRoles={['coach']}>
//                   <DashboardLayout><CoachDashboard /></DashboardLayout>
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/instructor/*"
//               element={
//                 <ProtectedRoute allowedRoles={['coach']}>
//                   <DashboardLayout><CoachDashboard /></DashboardLayout>
//                 </ProtectedRoute>
//               }
//             />

//             {/* Admin Routes */}
//             <Route
//               path="/admin/dashboard"
//               element={
//                 <ProtectedRoute allowedRoles={['admin']}>
//                   <DashboardLayout><AdminDashboard /></DashboardLayout>
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/admin/*"
//               element={
//                 <ProtectedRoute allowedRoles={['admin']}>
//                   <DashboardLayout><AdminDashboard /></DashboardLayout>
//                 </ProtectedRoute>
//               }
//             />

//             {/* Video Call */}
//             <Route
//               path="/video/:roomId"
//               element={
//                 <ProtectedRoute>
//                   <VideoCall />
//                 </ProtectedRoute>
//               }
//             />
//           </Routes>
//         </div>
//         <Toaster
//           position="top-right"
//           toastOptions={{
//             duration: 4000,
//             style: {
//               background: '#363636',
//               color: '#fff',
//             },
//             success: {
//               iconTheme: {
//                 primary: '#10B981',
//                 secondary: '#fff',
//               },
//             },
//             error: {
//               iconTheme: {
//                 primary: '#EF4444',
//                 secondary: '#fff',
//               },
//             },
//           }}
//         />
//       </Router>
//       </ThemeProvider>
//     </AuthProvider>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/common/Navbar';
import CountdownTimer from './components/common/CountdownTimer';
import ChatWidget from './components/chat/ChatWidget';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Coaches from './pages/Coaches';
import CoachProfile from './pages/CoachProfile';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import PDFPage from './pages/PDFPage';

import ClientDashboard from './pages/client/ClientDashboard';
import CoachDashboard from './pages/coach/CoachDashboard';
import CoachSessions from './pages/coach/CoachSessions';
import AdminDashboard from './pages/admin/AdminDashboard';

import VideoCall from './components/video/VideoCall';
import Games from './pages/Games';
import SudokuGame from './pages/SudokuGame';
import WordleGame from './pages/WordleGame';

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <CountdownTimer />
    {children}
    <ChatWidget />
    <Footer />
  </>
);

const DashboardLayout = ({ children }) => (
  <>
    <Navbar />
    <CountdownTimer />
    {children}
    <ChatWidget />
  </>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
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
            <Route path="/courses/:id" element={<PublicLayout><CourseDetails /></PublicLayout>} />
            <Route path="/pdf" element={<PublicLayout><PDFPage /></PublicLayout>} />
            <Route path="/games" element={<PublicLayout><Games /></PublicLayout>} />
            <Route path="/games/sudoku/:gameId" element={<PublicLayout><SudokuGame /></PublicLayout>} />
            <Route path="/games/wordle/:gameId" element={<PublicLayout><WordleGame /></PublicLayout>} />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <DashboardLayout><ClientDashboard /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/*"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <DashboardLayout><ClientDashboard /></DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Instructor Routes */}
            <Route
              path="/coach/sessions/new"
              element={
                <ProtectedRoute allowedRoles={['coach']}>
                  <DashboardLayout><CoachSessions /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['coach']}>
                  <DashboardLayout><CoachDashboard /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/*"
              element={
                <ProtectedRoute allowedRoles={['coach']}>
                  <DashboardLayout><CoachDashboard /></DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout><AdminDashboard /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout><AdminDashboard /></DashboardLayout>
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
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;