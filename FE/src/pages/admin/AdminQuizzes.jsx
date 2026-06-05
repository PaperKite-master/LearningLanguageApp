import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminQuizzesContent from '../../components/admin/AdminQuizzesContent';

const AdminQuizzes = () => {
  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main-area admin-dashboard-area">
        <AdminQuizzesContent />
      </main>
    </div>
  );
};

export default AdminQuizzes;
