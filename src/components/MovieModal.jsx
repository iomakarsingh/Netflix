import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBackdropUrl, getPosterUrl } from '../config/tmdb';
import { getMovieDetails, getTVDetails } from '../services/tmdb.service';
import { useProfile } from '../contexts/ProfileContext';
import './MovieModal.css';

export default function MovieModal({ item, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trailer, setTrailer] = useState(null);
  const navigate = useNavigate();
  const { addToMyList, removeFromMyList, isInMyList } = useProfile();

  const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
  const title = item.title || item.name || 'Unknown';
  const inList = isInMyList(item.id);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    const fetchDetails = async () => {
      setLoading(true);
      // Timeout wrapper — 3 seconds, then show basic info from item prop
      const withTimeout = (p, ms) => Promise.race([
        p,
        new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms)),
      ]);
      try {
        const fetchFn = mediaType === 'tv' ? getTVDetails : getMovieDetails;
        const data = await withTimeout(fetchFn(item.id), 3000);
        if (!cancelled) {
          setDetails(data);
          const videos = data.videos?.results || [];
          const t = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
            || videos.find(v => v.site === 'YouTube');
          setTrailer(t || null);
        }
      } catch {
        // On timeout/error show basic info from the item prop itself
        if (!cancelled) setDetails(item);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDetails();
    return () => { cancelled = true; };
  }, [item.id, mediaType]);

  const handlePlay = () => {
    onClose();
    navigate(`/watch/${mediaType}/${item.id}`);
  };

  const handleListToggle = () => {
    if (inList) removeFromMyList(item.id);
    else addToMyList(item);
  };

  const backdropUrl = (details?.backdrop_path || item.backdrop_path)
    ? getBackdropUrl(details?.backdrop_path || item.backdrop_path, 'w1280')
    : null;
  const posterUrl = (details?.poster_path || item.poster_path)
    ? getPosterUrl(details?.poster_path || item.poster_path, 'w342')
    : null;

  const rating = (details?.vote_average || item.vote_average)?.toFixed(1);
  const year = (details?.release_date || details?.first_air_date ||
    item.release_date || item.first_air_date || '').slice(0, 4);
  const runtime = details?.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : details?.episode_run_time?.[0]
      ? `${details.episode_run_time[0]}m/ep`
      : null;
  const genres = details?.genres?.slice(0, 3).map(g => g.name) || [];
  const seasons = details?.number_of_seasons;
  const cast = details?.credits?.cast?.slice(0, 8) || [];
  const similar = details?.similar?.results?.slice(0, 6) || [];
  const overview = details?.overview || item.overview || '';

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Details for ${title}`}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close" onClick={onClose} aria-label="Close modal" id="modal-close-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        {/* Hero Area */}
        <div className="modal-hero">
          {trailer ? (
            <div className="modal-video-wrap">
              <iframe
                className="modal-video"
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`}
                title={`${title} Trailer`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                frameBorder="0"
              />
            </div>
          ) : backdropUrl ? (
            <img className="modal-backdrop" src={backdropUrl} alt={title} />
          ) : posterUrl ? (
            <img className="modal-backdrop modal-backdrop-poster" src={posterUrl} alt={title} />
          ) : (
            <div className="modal-backdrop-placeholder"/>
          )}
          <div className="modal-hero-gradient"/>

          {/* Hero Content */}
          <div className="modal-hero-content">
            <h2 className="modal-title">{title}</h2>
            <div className="modal-hero-actions">
              <button className="btn btn-play" onClick={handlePlay} id="modal-play-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Play
              </button>
              <button
                className={`btn-icon modal-action-btn ${inList ? 'btn-in-list' : ''}`}
                onClick={handleListToggle}
                aria-label={inList ? 'Remove from My List' : 'Add to My List'}
                title={inList ? 'Remove from My List' : 'Add to My List'}
              >
                {inList ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                )}
              </button>
              <button className="btn-icon modal-action-btn" aria-label="I like this" title="I like this">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {loading ? (
            <div className="modal-loading">
              <div className="netflix-spinner"/>
            </div>
          ) : (
            <>
              {/* Left column */}
              <div className="modal-info">
                <div className="modal-meta-top">
                  {rating && <span className="modal-match">{Math.round(parseFloat(rating) * 10)}% Match</span>}
                  {year && <span className="modal-year">{year}</span>}
                  {runtime && <span className="modal-runtime">{runtime}</span>}
                  {seasons && <span className="modal-seasons">{seasons} Season{seasons > 1 ? 's' : ''}</span>}
                  <span className="modal-rating-badge">HD</span>
                </div>

                <p className="modal-overview">{overview}</p>
              </div>

              {/* Right column */}
              <div className="modal-details">
                {cast.length > 0 && (
                  <p className="modal-detail-line">
                    <span className="modal-detail-label">Cast: </span>
                    {cast.map(c => c.name).join(', ')}
                  </p>
                )}
                {genres.length > 0 && (
                  <p className="modal-detail-line">
                    <span className="modal-detail-label">Genres: </span>
                    {genres.join(', ')}
                  </p>
                )}
                {details?.status && (
                  <p className="modal-detail-line">
                    <span className="modal-detail-label">Status: </span>
                    {details.status}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Similar Content */}
          {similar.length > 0 && (
            <div className="modal-similar">
              <h3 className="modal-similar-title">More Like This</h3>
              <div className="modal-similar-grid">
                {similar.map(s => (
                  <div
                    key={s.id}
                    className="similar-card"
                    onClick={() => {
                      onClose();
                      // Brief delay so modal closes first
                      setTimeout(() => navigate(`/title/${mediaType}/${s.id}`), 100);
                    }}
                  >
                    {s.backdrop_path ? (
                      <img
                        src={getBackdropUrl(s.backdrop_path, 'w500')}
                        alt={s.title || s.name}
                        className="similar-card-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="similar-card-placeholder"/>
                    )}
                    <div className="similar-card-info">
                      <div className="similar-card-meta">
                        {s.vote_average && (
                          <span className="similar-match">
                            {Math.round(s.vote_average * 10)}% Match
                          </span>
                        )}
                        <span className="similar-year">
                          {(s.release_date || s.first_air_date || '').slice(0, 4)}
                        </span>
                      </div>
                      <p className="similar-overview">
                        {(s.overview || '').slice(0, 120)}{s.overview?.length > 120 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
