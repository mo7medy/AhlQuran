import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ResponsiveLayout from './components/Layout/MobileFrame';
import BottomNav from './components/Layout/BottomNav';
import AuthScreen from './pages/AuthScreen';
import HomeScreen from './pages/HomeScreen';
import LandingScreen from './pages/LandingScreen';
import MushafScreen from './pages/MushafScreen';
import MemorizationScreen from './pages/MemorizationScreen';
import TeachersScreen from './pages/TeachersScreen';
import TeacherProfileScreen from './pages/TeacherProfileScreen';
import ProfileScreen from './pages/ProfileScreen';
import CoursesScreen from './pages/CoursesScreen';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="flex items-center justify-center h-screen w-full bg-emerald-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/auth" />;
  
  return (
    <>
      <div className="flex-1 flex flex-col w-full overflow-hidden relative">
        {children}
      </div>
      <BottomNav />
    </>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingScreen />} />
      <Route path="/auth" element={!user ? <AuthScreen /> : <Navigate to="/dashboard" />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
      <Route path="/mushaf" element={<ProtectedRoute><MushafScreen /></ProtectedRoute>} />
      <Route path="/memorize" element={<ProtectedRoute><MemorizationScreen /></ProtectedRoute>} />
      <Route path="/teachers" element={<ProtectedRoute><TeachersScreen /></ProtectedRoute>} />
      <Route path="/teachers/:teacherId" element={<ProtectedRoute><TeacherProfileScreen /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute><CoursesScreen /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <ResponsiveLayout>
          <AppRoutes />
        </ResponsiveLayout>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;