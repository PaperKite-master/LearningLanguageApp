import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminLessonCreateContent from '../../components/admin/AdminLessonCreateContent';
import AdminCourseCreateContent from '../../components/admin/course/AdminCourseCreateContent';

const AdminLessonCreate = () => {
  const location = useLocation();
  const initialType = location.state?.initialContentType || 'lesson';

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main-area admin-dashboard-area">
        {initialType === 'lesson' ? (
          <AdminCourseCreateContent />
        ) : (
          <AdminLessonCreateContent />
        )}
      </main>
    </div>
  );
};

export default AdminLessonCreate;
