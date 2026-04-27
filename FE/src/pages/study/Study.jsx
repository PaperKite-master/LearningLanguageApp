import React from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import StudyContent from '../../components/study/StudyContent';

const Study = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-area study-area">
        <StudyContent />
      </main>
    </div>
  );
};

export default Study;
