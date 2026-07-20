import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import './BilingualVideoPlayer.css';

const YOUTUBE_ID_REGEX =
  /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

function extractYouTubeVideoId(url) {
  if (!url) return null;
  const match = url.match(YOUTUBE_ID_REGEX);
  if (match && match[2]?.length === 11) return match[2];
  return null;
}

function buildEmbedUrl(videoId, startSeconds = 0) {
  const params = new URLSearchParams({
    start: String(Math.floor(startSeconds)),
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    enablejsapi: '1',
    origin: window.location.origin,
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

let youtubeApiPromise = null;

function loadYouTubeIframeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve(window.YT);
    };

    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
  });

  return youtubeApiPromise;
}

const BilingualVideoPlayer = ({ videoUrl, subtitles = [] }) => {
  const videoId = useMemo(() => extractYouTubeVideoId(videoUrl), [videoUrl]);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const transcriptRef = useRef(null);
  const lineRefs = useRef([]);

  const [embedStart, setEmbedStart] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showJa, setShowJa] = useState(true);
  const [showVi, setShowVi] = useState(true);
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [apiReady, setApiReady] = useState(false);

  const embedUrl = useMemo(
    () => (videoId ? buildEmbedUrl(videoId, embedStart) : ''),
    [videoId, embedStart]
  );

  const initPlayerApi = useCallback(async () => {
    if (!iframeRef.current || !videoId || playerRef.current) return;

    try {
      const YT = await loadYouTubeIframeApi();
      playerRef.current = new YT.Player(iframeRef.current, {
        events: {
          onReady: () => setApiReady(true),
        },
      });
    } catch {
      setApiReady(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return undefined;

    const intervalId = window.setInterval(() => {
      const time = playerRef.current?.getCurrentTime?.();
      if (typeof time === 'number' && !Number.isNaN(time)) {
        setCurrentTime(time);
      }
    }, 300);

    return () => {
      window.clearInterval(intervalId);
      try {
        playerRef.current?.destroy?.();
      } catch {
        // ignore
      }
      playerRef.current = null;
      setApiReady(false);
    };
  }, [videoId]);

  const activeIndex = useMemo(() => {
    if (!subtitles.length) return -1;
    return subtitles.findIndex((seg, index) => {
      const nextStart = subtitles[index + 1]?.start ?? Infinity;
      return currentTime >= seg.start && currentTime < nextStart;
    });
  }, [currentTime, subtitles]);

  const activeSubtitle = activeIndex >= 0 ? subtitles[activeIndex] : null;

  useEffect(() => {
    const activeLine = lineRefs.current[activeIndex];
    if (activeLine && transcriptRef.current && showFullTranscript) {
      activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex, showFullTranscript]);

  const handleSeek = useCallback(
    (start) => {
      if (apiReady && playerRef.current?.seekTo) {
        playerRef.current.seekTo(start, true);
        playerRef.current.playVideo?.();
        return;
      }
      setEmbedStart(Math.floor(start));
    },
    [apiReady]
  );

  if (!videoId) return null;

  return (
    <div className="bilingual-video-layout">
      <div className="bilingual-video-toolbar">
        <h3>Video bài giảng</h3>
        {subtitles.length > 0 && (
          <div className="bilingual-track-toggles">
            <label>
              <input
                type="checkbox"
                checked={showJa}
                onChange={(e) => setShowJa(e.target.checked)}
              />
              Tiếng Nhật
            </label>
            <label>
              <input
                type="checkbox"
                checked={showVi}
                onChange={(e) => setShowVi(e.target.checked)}
              />
              Tiếng Việt
            </label>
          </div>
        )}
      </div>

      <div className="bilingual-video-player-wrap">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title="Lesson Video"
          className="bilingual-video-player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={initPlayerApi}
        />
      </div>

      {subtitles.length > 0 ? (
        <>
          <div className={`bilingual-live-caption ${activeSubtitle ? 'is-active' : ''}`}>
            {activeSubtitle ? (
              <>
                {showJa && (
                  <p className="live-caption-ja">{activeSubtitle.text_ja}</p>
                )}
                {showVi && (
                  <p className="live-caption-vi">{activeSubtitle.text_vi}</p>
                )}
              </>
            ) : (
              <p className="live-caption-placeholder">
                Phụ đề sẽ hiện ở đây khi video chạy...
              </p>
            )}
          </div>

          <button
            type="button"
            className="bilingual-transcript-toggle"
            onClick={() => setShowFullTranscript((prev) => !prev)}
          >
            {showFullTranscript ? 'Ẩn toàn bộ phụ đề' : 'Xem toàn bộ phụ đề'}
          </button>

          {showFullTranscript && (
            <div className="bilingual-transcript-list" ref={transcriptRef}>
              {subtitles.map((seg, index) => (
                <button
                  key={`${seg.start}-${index}`}
                  type="button"
                  ref={(el) => {
                    lineRefs.current[index] = el;
                  }}
                  className={`bilingual-transcript-line ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => handleSeek(seg.start)}
                >
                  {showJa && <span className="line-ja">{seg.text_ja}</span>}
                  {showVi && <span className="line-vi">{seg.text_vi}</span>}
                  <span className="line-time">{formatTime(seg.start)}</span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="bilingual-transcript-empty">
          <p>Chưa có phụ đề cho bài học này.</p>
          <p className="hint">
            Admin vào <strong>Courses → icon Languages (tím)</strong> hoặc{' '}
            <strong>Edit → Tạo phụ đề song ngữ</strong>.
          </p>
        </div>
      )}
    </div>
  );
};

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default BilingualVideoPlayer;
