import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminDashboardContent from '../../components/admin/AdminDashboardContent';

const AdminDashboard = () => {
  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main-area admin-dashboard-area">
        <AdminDashboardContent />
      </main>
    </div>
  );
};

export default AdminDashboard;
