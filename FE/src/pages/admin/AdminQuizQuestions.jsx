import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminQuizQuestionsContent from '../../components/admin/AdminQuizQuestionsContent';

const AdminQuizQuestions = () => {
  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main-area admin-dashboard-area">
        <AdminQuizQuestionsContent />
      </main>
    </div>
  );
};

export default AdminQuizQuestions;
