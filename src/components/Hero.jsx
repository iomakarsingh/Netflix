import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBackdropUrl, getPosterUrl } from '../config/tmdb';
import { getMovieDetails, getTVDetails } from '../services/tmdb.service';
import './Hero.css';

const FALLBACK_BACKDROP = 'https://image.tmdb.org/t/p/w1280/wwemzKWzjKYJFfdjqvR684zc1kH.jpg';

export default function Hero({ items = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailer, setTrailer] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const navigate = useNavigate();

  const featured = items[currentIndex];

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(i => (i + 1) % Math.min(items.length, 6));
        setTransitioning(false);
        setTrailer(null);
        setShowTrailer(false);
      }, 400);
    }, 8000);
    return () => clearInterval(timer);
  }, [items.length]);

  // Fetch trailer after delay
  useEffect(() => {
    if (!featured) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const withTimeout = (p, ms) => Promise.race([
          p,
          new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms)),
        ]);
        const fetchFn = featured.media_type === 'tv' ? getTVDetails : getMovieDetails;
        const details = await withTimeout(fetchFn(featured.id), 3000);
        const videos = details.videos?.results || [];
        const trailerVideo =
          videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
          videos.find(v => v.site === 'YouTube');
        if (!cancelled && trailerVideo) {
          setTrailer(trailerVideo);
          setShowTrailer(true);
        }
      } catch {
        // No trailer — that's fine, backdrop image shows instead
      }
    }, 3000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [featured?.id]);

  const handlePlay = () => {
    if (featured) navigate(`/watch/${featured.media_type || 'movie'}/${featured.id}`);
  };

  const handleMore = () => {
    if (featured) navigate(`/title/${featured.media_type || 'movie'}/${featured.id}`);
  };

  const goToSlide = useCallback((idx) => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(idx);
      setTransitioning(false);
      setTrailer(null);
      setShowTrailer(false);
    }, 300);
  }, []);

  if (!featured) return null;

  const title = featured.title || featured.name || 'Unknown';
  const overview = featured.overview || '';
  const backdropPath = featured.backdrop_path;
  const backdropUrl = backdropPath
    ? getBackdropUrl(backdropPath, 'original')
    : FALLBACK_BACKDROP;
  const rating = featured.vote_average ? featured.vote_average.toFixed(1) : null;
  const year = (featured.release_date || featured.first_air_date || '').slice(0, 4);

  return (
    <section className={`hero ${transitioning ? 'hero-transitioning' : ''}`} aria-label={`Featured: ${title}`}>
      {/* Background */}
      <div className="hero-bg">
        {showTrailer && trailer ? (
          <div className="hero-video-wrap">
            <iframe
              className="hero-video"
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&loop=1&playlist=${trailer.key}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3`}
              title={`${title} Trailer`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        ) : (
          <img
            className="hero-backdrop"
            src={backdropUrl}
            alt={title}
            loading="eager"
          />
        )}
        <div className="hero-gradient-left"/>
        <div className="hero-gradient-bottom"/>
      </div>

      {/* Content */}
      <div className="hero-content">
        <div className="hero-meta">
          {rating && (
            <span className="hero-rating">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5c518">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {rating}
            </span>
          )}
          {year && <span className="hero-year">{year}</span>}
          {featured.media_type === 'tv' && (
            <span className="hero-badge">TV Series</span>
          )}
        </div>

        <h1 className="hero-title">{title}</h1>

        {overview && (
          <p className="hero-overview">
            {overview.length > 200 ? `${overview.slice(0, 197)}...` : overview}
          </p>
        )}

        <div className="hero-actions">
          <button className="btn btn-play" onClick={handlePlay} id="hero-play-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Play
          </button>
          <button className="btn btn-info" onClick={handleMore} id="hero-more-info-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            More Info
          </button>
        </div>
      </div>

      {/* Slide Dots */}
      {items.length > 1 && (
        <div className="hero-dots" aria-label="Hero navigation">
          {items.slice(0, 6).map((_, idx) => (
            <button
              key={idx}
              className={`hero-dot ${idx === currentIndex ? 'hero-dot-active' : ''}`}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Age Rating badge */}
      <div className="hero-age-badge">
        <span className="age-rating-label">PG-13</span>
      </div>
    </section>
  );
}
