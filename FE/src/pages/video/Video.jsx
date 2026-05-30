import React from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import VideosContent from '../../components/video/VideosContent';

const Video = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-area">
        <VideosContent />
      </main>
    </div>
  );
};

export default Video;
