import React from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardContent from '../../components/dashboard/DashboardContent';

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-area">
        <DashboardContent />
      </main>
    </div>
  );
};

export default Dashboard;
