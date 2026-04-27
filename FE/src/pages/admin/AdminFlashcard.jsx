import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminFlashcardsContent from '../../components/admin/AdminFlashcardsContent';

const AdminFlashcard = () => {
  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main-area admin-dashboard-area">
        <AdminFlashcardsContent />
      </main>
    </div>
  );
};

export default AdminFlashcard;
