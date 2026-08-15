import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getTVDetails } from '../services/tmdb.service';
import { getBackdropUrl } from '../config/tmdb';
import './WatchPage.css';

export default function WatchPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  const controlsTimer = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const fetchFn = type === 'tv' ? getTVDetails : getMovieDetails;
        const data = await fetchFn(id);
        setDetails(data);
        const videos = data.videos?.results || [];
        const t = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
          || videos.find(v => v.site === 'YouTube');
        setTrailer(t || null);
      } catch {
        setDetails(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, type]);

  // Simulate progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => p < 100 ? p + 0.05 : p);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-hide controls
  const resetControlsTimer = () => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    resetControlsTimer();
    return () => clearTimeout(controlsTimer.current);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const title = details?.title || details?.name || 'Loading...';
  const backdropUrl = details?.backdrop_path
    ? getBackdropUrl(details.backdrop_path, 'original')
    : null;

  return (
    <div
      ref={containerRef}
      className={`watch-page ${showControls ? '' : 'hide-cursor'}`}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      {/* Back Button */}
      <button
        className={`watch-back-btn ${showControls ? 'controls-visible' : ''}`}
        onClick={() => navigate(-1)}
        id="watch-back-btn"
        aria-label="Go back"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        <span>Back</span>
      </button>

      {/* Video Area */}
      {loading ? (
        <div className="watch-loading">
          <div className="netflix-spinner"/>
        </div>
      ) : trailer ? (
        <div className="watch-video-wrap">
          <iframe
            className="watch-video"
            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&controls=0&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3${isMuted ? '&mute=1' : ''}`}
            title={title}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            frameBorder="0"
          />
        </div>
      ) : backdropUrl ? (
        <div className="watch-backdrop">
          <img src={backdropUrl} alt={title} className="watch-backdrop-img" />
          <div className="watch-no-trailer">
            <p>Trailer not available</p>
            <p className="watch-no-trailer-sub">Full playback requires a Netflix subscription</p>
          </div>
        </div>
      ) : (
        <div className="watch-blank">
          <div className="netflix-spinner"/>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`watch-controls ${showControls ? 'controls-visible' : ''}`}>
        {/* Top bar */}
        <div className="watch-controls-top">
          <div className="watch-title-wrap">
            <h1 className="watch-title">{title}</h1>
            {type === 'tv' && (
              <p className="watch-episode">Season 1 · Episode 1</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="watch-progress-wrap">
          <div className="watch-progress-bar">
            <div
              className="watch-progress-fill"
              style={{ width: `${progress}%` }}
            />
            <div
              className="watch-progress-thumb"
              style={{ left: `${progress}%` }}
            />
          </div>
          <div className="watch-time-row">
            <span className="watch-time">
              {Math.floor(progress * 1.2)}:{String(Math.floor((progress * 1.2 % 1) * 60)).padStart(2, '0')} /
              {type === 'movie'
                ? ` ${details?.runtime ? `${Math.floor(details.runtime / 60)}:${String(details.runtime % 60).padStart(2, '0')}` : '1:45:00'}`
                : ' 0:45:00'
              }
            </span>
            <span className="watch-time-right">HD</span>
          </div>
        </div>

        {/* Playback Buttons */}
        <div className="watch-controls-bottom">
          <div className="watch-controls-left">
            {/* Play/Pause */}
            <button
              className="watch-btn"
              onClick={() => setIsPlaying(p => !p)}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              id="watch-play-btn"
            >
              {isPlaying ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Skip Back */}
            <button className="watch-btn" aria-label="Rewind 10 seconds" id="watch-rewind-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
              </svg>
              <span className="watch-btn-label">10</span>
            </button>

            {/* Skip Forward */}
            <button className="watch-btn" aria-label="Forward 10 seconds" id="watch-forward-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2z"/>
              </svg>
              <span className="watch-btn-label">10</span>
            </button>

            {/* Volume */}
            <button
              className="watch-btn"
              onClick={() => setIsMuted(m => !m)}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              id="watch-mute-btn"
            >
              {isMuted ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </button>

            {/* Volume Slider */}
            <div className="watch-volume-slider">
              <input
                type="range"
                min="0"
                max="100"
                defaultValue={isMuted ? 0 : 80}
                className="volume-range"
                aria-label="Volume"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="watch-controls-right">
            {/* Subtitles */}
            <button className="watch-btn watch-btn-sm" aria-label="Subtitles" id="watch-subtitles-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9 8H9.5v-.5h-2v3h2V14H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V14H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"/>
              </svg>
            </button>

            {/* Audio & Subtitles */}
            <button className="watch-btn watch-btn-sm" aria-label="Audio and subtitles" id="watch-audio-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
              </svg>
            </button>

            {/* Episodes (TV only) */}
            {type === 'tv' && (
              <button className="watch-btn watch-btn-sm" aria-label="Episodes" id="watch-episodes-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
                </svg>
              </button>
            )}

            {/* Fullscreen */}
            <button
              className="watch-btn watch-btn-sm"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              id="watch-fullscreen-btn"
            >
              {isFullscreen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
