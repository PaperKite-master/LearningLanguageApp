import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminUsersContent from '../../components/admin/AdminUsersContent';

const AdminUsers = () => {
  return (
    <div className="dashboard-layout students-dashboard-override">
      <AdminSidebar /* Keep it active by react-router NavLink matching route */ />
      <main className="dashboard-main-area admin-dashboard-area students-main-area-light">
        <AdminUsersContent />
      </main>
    </div>
  );
};

export default AdminUsers;
