import React, { useState } from 'react';
import { Play, ChevronDown, Youtube, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './VideosContent.css';

import timelineApi from '../../api/timelineApi';
import BilingualVideoPlayer from '../study/BilingualVideoPlayer';
import { useAuth } from '../../context/AuthContext';
import { getAccessibleTimelines, getFirstUnlockedTimeline, getVisibleTimelines, hasFullTimelineAccess } from '../../utils/planAccess';
import ProUpgradeBanner from '../common/ProUpgradeBanner';

const VideosContent = () => {
  const navigate = useNavigate();
  const { user, status } = useAuth();
  const [timelines, setTimelines] = useState([]);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    if (status !== 'ready') return;

    const fetchData = async () => {
      try {
        const data = await timelineApi.getAll();
        const accessibleTimelines = getAccessibleTimelines(data, user?.role);
        const visibleTimelines = getVisibleTimelines(data, user?.role)
          .map((timeline) => ({
            ...timeline,
            lessons: (timeline.lessons || []).filter((lesson) => lesson.status === 'published' && lesson.videoUrl),
          }))
          .filter((timeline) => timeline.lessons.length > 0);

        setTimelines(visibleTimelines);

        const defaultTimeline = getFirstUnlockedTimeline(accessibleTimelines, user?.role);
        if (defaultTimeline) {
          setSelectedTimeline(defaultTimeline);
          if (defaultTimeline.lessons.length > 0) {
            setPlayingVideo(defaultTimeline.lessons[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch videos', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [status, user?.role]);

  const handleSelectTimeline = (timeline) => {
    if (timeline.isLocked) {
      navigate('/profile');
      return;
    }
    setSelectedTimeline(timeline);
    setPlayingVideo(timeline.lessons[0] || null);
    setIsDropdownOpen(false);
  };

  const handleSelectVideo = (video, timeline) => {
    if (timeline?.isLocked) {
      navigate('/profile');
      return;
    }
    setPlayingVideo(video);
  };

  return (
    <div className="video-page-container">
      <h1 className="video-page-title">VIDEO BÀI GIẢNG</h1>
      
      <div className="video-columns-wrapper">
        <div className="video-left-panel">
          {!isLoading && !hasFullTimelineAccess(user?.role) && (
            <ProUpgradeBanner
              title="Video: timeline đầu tiên miễn phí"
              description="USER có thể xem video thuộc timeline đầu tiên. Nâng cấp PRO để xem toàn bộ."
            />
          )}

          <div className="video-player-card">
            {playingVideo ? (
              <BilingualVideoPlayer
                key={playingVideo.id}
                videoUrl={playingVideo.videoUrl}
                subtitles={Array.isArray(playingVideo.subtitles) ? playingVideo.subtitles : []}
              />
            ) : (
              <div className="video-player-screen">
                <div className="video-play-button-center">
                  <Play size={24} color="#1a1a1a" fill="#1a1a1a" style={{ marginLeft: '4px' }} />
                </div>
              </div>
            )}
          </div>
        </div>

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
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      marginTop: '4px',
                      zIndex: 10,
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {timelines.map((timeline) => (
                      <div
                        key={timeline.id}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f1f5f9',
                          opacity: timeline.isLocked ? 0.65 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                        }}
                        onClick={() => handleSelectTimeline(timeline)}
                      >
                        <span>{timeline.title}</span>
                        {timeline.isLocked && <Lock size={14} color="#7c3aed" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="video-playlist">
                {selectedTimeline?.lessons.map((video) => (
                  <div
                    key={video.id}
                    className={`video-playlist-item ${playingVideo?.id === video.id ? 'active' : ''} ${selectedTimeline?.isLocked ? 'is-locked' : ''}`}
                    onClick={() => handleSelectVideo(video, selectedTimeline)}
                  >
                    <div className="video-item-icon">
                      {selectedTimeline?.isLocked ? <Lock size={18} /> : <Youtube size={20} strokeWidth={1.5} />}
                    </div>
                    <div className="video-item-info">
                      <h4>{video.title}</h4>
                      <span>{selectedTimeline?.isLocked ? 'Yêu cầu PRO' : 'Video'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideosContent;
