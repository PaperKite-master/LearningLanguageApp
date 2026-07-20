import React, { useEffect } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import VideosContent from '../../components/video/VideosContent';

const Video = () => {
  useEffect(() => {
    const mainArea = document.querySelector('.video-main-area');
    if (!mainArea) return undefined;

    const handleWheel = (event) => {
      const overPlayer = event.target.closest('.bilingual-video-player-wrap, .bilingual-video-player');
      if (!overPlayer) return;
      mainArea.scrollTop += event.deltaY;
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-area video-main-area">
        <VideosContent />
      </main>
    </div>
  );
};

export default Video;
