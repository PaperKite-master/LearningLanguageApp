import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import Dashboard from './pages/dashboard/Dashboard';
import Study from './pages/study/Study';
import LessonDetail from './pages/study/LessonDetail';
import Alphabet from './pages/alphabet/Alphabet';
import Progress from './pages/progress/Progress';
import Profile from './pages/profile/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminContent from './pages/admin/AdminContent';
import AdminLessonCreate from './pages/admin/AdminLessonCreate';
import AdminFlashcard from './pages/admin/AdminFlashcard';
import AdminTimeline from './pages/admin/AdminTimeline';
import AdminSettings from './pages/admin/AdminSettings';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Study Page  */}
        <Route path="/study" element={<Study />} />
        <Route path="/lesson/:id" element={<LessonDetail />} />

        {/* Alphabet Page */}
        <Route path="/alphabet" element={<Alphabet />} />

        {/* Progress Page */}
        <Route path="/progress" element={<Progress />} />

        {/* Profile Page */}
        <Route path="/profile" element={<Profile />} />

        {/* Admin Pages */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="/admin/content/create" element={<AdminLessonCreate />} />
        <Route path="/admin/timeline" element={<AdminTimeline />} />
        <Route path="/admin/flashcard" element={<AdminFlashcard />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
