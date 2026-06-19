import React from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import StudyContent from '../../components/study/StudyContent';

import DashboardTopBar from '../../components/dashboard/DashboardTopBar';
import '../dashboard/DashboardNew.css';

const Study = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-area study-area">
        <DashboardTopBar />
        <StudyContent />
      </main>
    </div>
  );
};

export default Study;
