import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminLessonCreateContent from '../../components/admin/AdminLessonCreateContent';

const AdminLessonCreate = () => {
  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main-area admin-dashboard-area">
        <AdminLessonCreateContent />
      </main>
    </div>
  );
};

export default AdminLessonCreate;
