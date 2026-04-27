import React from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import ProgressContent from '../../components/progress/ProgressContent';

const Progress = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-area progress-area">
        <ProgressContent />
      </main>
    </div>
  );
};

export default Progress;
