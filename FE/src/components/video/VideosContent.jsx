import React, { useState } from 'react';
import { Play, ChevronDown, MessageSquare, Settings, Maximize, Youtube, FileText } from 'lucide-react';
import './VideosContent.css';

import timelineApi from '../../api/timelineApi';

const VideosContent = () => {
  const [timelines, setTimelines] = useState([]);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await timelineApi.getAll();
        // Filter timelines that actually have published video lessons
        const validTimelines = data.map(t => {
          const validLessons = (t.lessons || []).filter(l => l.status === 'published' && l.videoUrl);
          return { ...t, lessons: validLessons };
        }).filter(t => t.lessons.length > 0);

        setTimelines(validTimelines);
        if (validTimelines.length > 0) {
          setSelectedTimeline(validTimelines[0]);
          if (validTimelines[0].lessons.length > 0) {
            setPlayingVideo(validTimelines[0].lessons[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch videos', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to extract YouTube embed URL
  const getEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  };

  return (
    <div className="video-page-container">
      {/* Left side: Video Player */}
      <div className="video-left-panel">
        <div className="video-player-card">
          <div className="video-player-screen" style={{ padding: 0, overflow: 'hidden' }}>
            {playingVideo ? (
              <iframe
                width="100%"
                height="100%"
                src={getEmbedUrl(playingVideo.videoUrl)}
                title={playingVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="video-play-button-center">
                <Play size={24} color="#1a1a1a" fill="#1a1a1a" style={{ marginLeft: '4px' }} />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Right side: Playlist */}
      <div className="video-right-panel">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Đang tải...</div>
        ) : timelines.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Chưa có video nào.</div>
        ) : (
          <>
            <h2 className="video-module-title">{playingVideo?.title || 'Chọn bài học'}</h2>
            
            <div className="video-module-dropdown" style={{ position: 'relative' }}>
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', width: '100%', cursor: 'pointer' }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{selectedTimeline?.title || 'Chọn Module'}</span>
                <ChevronDown size={16} />
              </div>
              
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, 
                  background: 'white', border: '1px solid #e2e8f0', 
                  borderRadius: '8px', marginTop: '4px', zIndex: 10,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  {timelines.map(t => (
                    <div 
                      key={t.id} 
                      style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                      onClick={() => {
                        setSelectedTimeline(t);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="video-playlist">
              {selectedTimeline?.lessons.map(video => (
                <div 
                  key={video.id} 
                  className={`video-playlist-item ${playingVideo?.id === video.id ? 'active' : ''}`}
                  onClick={() => setPlayingVideo(video)}
                >
                  <div className="video-item-icon">
                    <Youtube size={20} strokeWidth={1.5} />
                  </div>
                  <div className="video-item-info">
                    <h4>{video.title}</h4>
                    <span>Video</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideosContent;
