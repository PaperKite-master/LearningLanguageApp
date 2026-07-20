import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
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
import AdminVideos from './pages/admin/AdminVideos';
import AdminSettings from './pages/admin/AdminSettings';
import UserSettings from './pages/settings/UserSettings';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import PaymentResult from './pages/payment/PaymentResult';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

function OAuthRedirect() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token') && !hash.includes('type=recovery')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        window.history.replaceState(null, '', window.location.pathname + window.location.search);

        refreshAuth()
          .then((user) => {
            if (!user) {
              navigate('/login');
              return;
            }
            navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/study');
          })
          .catch(() => navigate('/login'));
      }
    }
  }, [navigate, refreshAuth]);

  return null;
}

function RecoveryRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery') && hash.includes('access_token')) {
      navigate('/reset-password' + hash);
    }
  }, [navigate]);
  return null;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <RecoveryRedirect />
        <OAuthRedirect />
        <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/dashboard" element={<Navigate to="/study" replace />} />
        
        <Route path="/study" element={<ProtectedRoute><Study /></ProtectedRoute>} />
        <Route path="/lesson/:id" element={<ProtectedRoute><LessonDetail /></ProtectedRoute>} />

        <Route path="/alphabet" element={<ProtectedRoute><Alphabet /></ProtectedRoute>} />

        <Route path="/flashcard" element={<ProtectedRoute><Flashcard /></ProtectedRoute>} />

        <Route path="/videos" element={<ProtectedRoute><Video /></ProtectedRoute>} />

        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />

        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/payment/result" element={<ProtectedRoute><PaymentResult /></ProtectedRoute>} />

        <Route path="/quiz/:id" element={<ProtectedRoute><QuizTake /></ProtectedRoute>} />
        
        <Route path="/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/content" element={<ProtectedRoute adminOnly><AdminContent /></ProtectedRoute>} />
        <Route path="/admin/content/create" element={<ProtectedRoute adminOnly><AdminLessonCreate /></ProtectedRoute>} />
        <Route path="/admin/timeline" element={<ProtectedRoute adminOnly><AdminTimeline /></ProtectedRoute>} />
        <Route path="/admin/videos" element={<ProtectedRoute adminOnly><AdminVideos /></ProtectedRoute>} />
        <Route path="/admin/flashcard" element={<ProtectedRoute adminOnly><AdminFlashcard /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/tests" element={<ProtectedRoute adminOnly><AdminQuizzes /></ProtectedRoute>} />
        <Route path="/admin/tests/:id/questions" element={<ProtectedRoute adminOnly><AdminQuizQuestions /></ProtectedRoute>} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
