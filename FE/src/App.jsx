import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import Dashboard from './pages/dashboard/Dashboard';
import Study from './pages/study/Study';
import LessonDetail from './pages/study/LessonDetail';
import Alphabet from './pages/alphabet/Alphabet';
import Progress from './pages/progress/Progress';
import Profile from './pages/profile/Profile';
import Flashcard from './pages/flashcard/Flashcard';
import Video from './pages/video/Video';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminContent from './pages/admin/AdminContent';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminQuizQuestions from './pages/admin/AdminQuizQuestions';
import QuizTake from './pages/quiz/QuizTake';
import AdminLessonCreate from './pages/admin/AdminLessonCreate';
import AdminFlashcard from './pages/admin/AdminFlashcard';
import AdminTimeline from './pages/admin/AdminTimeline';
import AdminSettings from './pages/admin/AdminSettings';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import './index.css';
import './index.css';
import authApi from './api/authApi';

function OAuthRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token') && !hash.includes('type=recovery')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        
        // Fetch profile to make sure it's created and to get role
        authApi.getMe().then((user) => {
           localStorage.setItem('user', JSON.stringify(user));
           if (user.role === 'ADMIN') navigate('/admin/dashboard');
           else navigate('/dashboard');
        }).catch(err => {
           console.error('Failed to sync profile after OAuth', err);
           navigate('/login');
        });
      }
    }
  }, [navigate]);
  return null;
}

function RecoveryRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery') && hash.includes('access_token')) {
      // Navigate to reset password and preserve the hash
      navigate('/reset-password' + hash);
    }
  }, [navigate]);
  return null;
}

function App() {
  return (
    <Router>
      <RecoveryRedirect />
      <OAuthRedirect />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Study Page  */}
        <Route path="/study" element={<Study />} />
        <Route path="/lesson/:id" element={<LessonDetail />} />

        {/* Alphabet Page */}
        <Route path="/alphabet" element={<Alphabet />} />

        {/* Flashcard Page */}
        <Route path="/flashcard" element={<Flashcard />} />

        {/* Video Page */}
        <Route path="/videos" element={<Video />} />

        {/* Progress Page */}
        <Route path="/progress" element={<Progress />} />

        {/* Profile Page */}
        <Route path="/profile" element={<Profile />} />

        {/* Quiz Take Page */}
        <Route path="/quiz/:id" element={<QuizTake />} />

        {/* Admin Pages */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="/admin/content/create" element={<AdminLessonCreate />} />
        <Route path="/admin/timeline" element={<AdminTimeline />} />
        <Route path="/admin/flashcard" element={<AdminFlashcard />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/tests" element={<AdminQuizzes />} />
        <Route path="/admin/tests/:id/questions" element={<AdminQuizQuestions />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
