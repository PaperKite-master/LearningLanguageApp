import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminSettingsContent from '../../components/admin/AdminSettingsContent';

const AdminSettings = () => {
  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main-area admin-dashboard-area">
        <AdminSettingsContent />
      </main>
    </div>
  );
};

export default AdminSettings;
