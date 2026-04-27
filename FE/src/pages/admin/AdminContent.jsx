import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminContentList from '../../components/admin/AdminContentList';

const AdminContent = () => {
  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main-area admin-dashboard-area">
        <AdminContentList />
      </main>
    </div>
  );
};

export default AdminContent;
