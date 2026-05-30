import React, { useState } from 'react';
import { Play, Check, Clock } from 'lucide-react';
import './VideosContent.css';

const MOCK_VIDEOS = [
  {
    id: 1,
    title: 'CÁC LỜI CHÀO TRONG MÔI TRƯỜNG LÀM VIỆC NHẬT BẢN',
    description: 'Học những lời chào cơ bản được sử dụng trong các công ty CNTT Nhật Bản.',
    duration: '12 phút',
    completed: true,
  },
  {
    id: 2,
    title: 'GIỚI THIỆU BẢN THÂN BẰNG TIẾNG NHẬT',
    description: 'Cách tự giới thiệu trong một buổi phỏng vấn công nghệ tại Nhật Bản.',
    duration: '15 phút',
    completed: true,
  },
  {
    id: 3,
    title: 'CÁC CỤM TỪ TRONG CUỘC HỌP HẰNG NGÀY',
    description: 'Những cụm từ quan trọng cho các cuộc họp agile standup bằng tiếng Nhật.',
    duration: '18 phút',
    completed: false,
  },
  {
    id: 4,
    title: 'TỪ VỰNG TRONG CODE REVIEW',
    description: 'Các thuật ngữ kỹ thuật được sử dụng trong quá trình code review với đồng nghiệp người Nhật.',
    duration: '20 phút',
    completed: false,
  },
  {
    id: 5,
    title: 'VIẾT EMAIL',
    description: 'Cách viết email chuyên nghiệp bằng tiếng Nhật.',
    duration: '22 phút',
    completed: false,
  }
];

const VideosContent = () => {
  const [playingVideo, setPlayingVideo] = useState(null);

  const handlePlay = (video) => {
    setPlayingVideo(video);
  };

  const handleClose = () => {
    setPlayingVideo(null);
  };

  if (playingVideo) {
    return (
      <div className="videos-container player-view">
        <div className="video-player-wrapper">
          <div className="video-player-mock">
            <div className="play-icon-large">
              <svg viewBox="0 0 24 24" width="70" height="70" stroke="currentColor" strokeWidth="2" fill="#d9d9d9" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
          </div>
          <div className="player-actions">
            <button className="done-btn" onClick={handleClose}>Xong</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="videos-container">
      <h2 className="videos-title">BÀI HỌC VIDEO</h2>
      
      <div className="videos-list">
        {MOCK_VIDEOS.map(video => (
          <div key={video.id} className="video-card">
            <div className="video-icon-wrapper">
              {video.completed ? (
                <div className="icon-circle completed">
                  <Check size={28} color="#00E5FF" strokeWidth={3} />
                </div>
              ) : (
                <div className="icon-circle pending">
                  <Play size={28} color="#a560ff" fill="#a560ff" />
                </div>
              )}
            </div>
            
            <div className="video-info">
              <h3>{video.title}</h3>
              <p>{video.description}</p>
              <div className="video-meta">
                <Clock size={14} />
                <span>{video.duration}</span>
              </div>
            </div>
            
            <div className="video-action">
              <button 
                className={`action-btn ${video.completed ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => handlePlay(video)}
              >
                {video.completed ? 'Xem lại' : 'Xem'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideosContent;
