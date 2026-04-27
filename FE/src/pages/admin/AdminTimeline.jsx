import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTimelineContent from '../../components/admin/AdminTimelineContent';

const AdminTimeline = () => {
  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main-area admin-dashboard-area">
        <AdminTimelineContent />
      </main>
    </div>
  );
};

export default AdminTimeline;
