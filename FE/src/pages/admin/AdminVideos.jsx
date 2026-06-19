import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminVideosContent from '../../components/admin/AdminVideosContent';

const AdminVideos = () => {
  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main-area admin-dashboard-area">
        <AdminVideosContent />
      </main>
    </div>
  );
};

export default AdminVideos;
