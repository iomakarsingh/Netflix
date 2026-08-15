import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosterUrl, getBackdropUrl } from '../config/tmdb';
import { useProfile } from '../contexts/ProfileContext';
import MovieModal from './MovieModal';
import './MovieRow.css';

const PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="169" viewBox="0 0 300 169"%3E%3Crect width="300" height="169" fill="%23181818"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23404040" font-size="14" font-family="Arial"%3ENo Image%3C/text%3E%3C/svg%3E';

function MovieCard({ item, onSelect, isLarge = false }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const hoverTimer = useRef(null);
  const { isInMyList } = useProfile();

  const title = item.title || item.name || 'Unknown';
  const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
  const imageUrl = isLarge
    ? (item.poster_path ? getPosterUrl(item.poster_path, 'w342') : null)
    : (item.backdrop_path ? getBackdropUrl(item.backdrop_path, 'w500') : item.poster_path ? getPosterUrl(item.poster_path, 'w342') : null);

  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const inList = isInMyList(item.id);

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setHovered(true), 350);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    setHovered(false);
  };

  return (
    <div
      className={`movie-card ${isLarge ? 'movie-card-large' : ''} ${hovered ? 'movie-card-hovered' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(item)}
      aria-label={`${title}. Click for details`}
    >
      <div className="movie-card-img-wrap">
        <img
          className="movie-card-img"
          src={imgError || !imageUrl ? PLACEHOLDER_IMG : imageUrl}
          alt={title}
          loading="lazy"
          onError={() => setImgError(true)}
        />

        {/* Hover Overlay */}
        {hovered && (
          <div className="movie-card-overlay">
            {/* Play button */}
            <button
              className="card-play-btn"
              onClick={(e) => { e.stopPropagation(); onSelect(item, 'play'); }}
              aria-label={`Play ${title}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>

            {/* Action Row */}
            <div className="card-actions">
              <div className="card-actions-left">
                <button
                  className="btn-icon card-action-btn"
                  onClick={(e) => { e.stopPropagation(); onSelect(item, 'play'); }}
                  aria-label={`Play ${title}`}
                  title="Play"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>

                <button
                  className={`btn-icon card-action-btn ${inList ? 'in-list' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onSelect(item, 'list'); }}
                  aria-label={inList ? 'Remove from My List' : 'Add to My List'}
                  title={inList ? 'Remove from My List' : 'Add to My List'}
                >
                  {inList ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                  )}
                </button>

                <button
                  className="btn-icon card-action-btn"
                  onClick={(e) => { e.stopPropagation(); onSelect(item, 'like'); }}
                  aria-label="I like this"
                  title="I like this"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                  </svg>
                </button>
              </div>

              <button
                className="btn-icon card-action-btn"
                onClick={(e) => { e.stopPropagation(); onSelect(item); }}
                aria-label="More info"
                title="More info"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>
                </svg>
              </button>
            </div>

            {/* Card Meta */}
            <div className="card-meta">
              <div className="card-meta-row">
                {rating && (
                  <span className="card-rating">
                    <span className="rating-dot"/>
                    {rating} ★
                  </span>
                )}
                {year && <span className="card-year">{year}</span>}
                {mediaType === 'tv' && <span className="card-type">Series</span>}
              </div>
              <p className="card-title">{title}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MovieRow({ title, items = [], isLarge = false, isLoading = false }) {
  const [modalItem, setModalItem] = useState(null);
  const [scrollPos, setScrollPos] = useState(0);
  const rowRef = useRef(null);
  const { addToMyList, removeFromMyList, isInMyList } = useProfile();
  const navigate = useNavigate();

  const scroll = useCallback((direction) => {
    const row = rowRef.current;
    if (!row) return;
    const cardWidth = row.querySelector('.movie-card')?.offsetWidth || 200;
    const visibleCards = Math.floor(row.offsetWidth / cardWidth);
    const scrollAmount = cardWidth * Math.max(visibleCards - 1, 2);
    row.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
  }, []);

  const handleScroll = useCallback(() => {
    if (rowRef.current) setScrollPos(rowRef.current.scrollLeft);
  }, []);

  const handleSelect = (item, action) => {
    if (action === 'play') {
      const type = item.media_type || (item.title ? 'movie' : 'tv');
      navigate(`/watch/${type}/${item.id}`);
      return;
    }
    if (action === 'list') {
      if (isInMyList(item.id)) {
        removeFromMyList(item.id);
      } else {
        addToMyList(item);
      }
      return;
    }
    setModalItem(item);
  };

  const maxScroll = rowRef.current
    ? rowRef.current.scrollWidth - rowRef.current.offsetWidth
    : 0;

  if (isLoading) {
    return (
      <section className="movie-row">
        <h2 className="row-title">{title}</h2>
        <div className="row-track skeleton-row">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`skeleton-card ${isLarge ? 'skeleton-card-large' : ''}`}/>
          ))}
        </div>
      </section>
    );
  }

  if (!items?.length) return null;

  return (
    <>
      <section className="movie-row">
        <h2 className="row-title">{title}</h2>

        <div className="row-slider-wrap">
          {/* Left Arrow */}
          {scrollPos > 10 && (
            <button
              className="row-arrow row-arrow-left"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
              </svg>
            </button>
          )}

          {/* Cards Track */}
          <div
            ref={rowRef}
            className={`row-track ${isLarge ? 'row-track-large' : ''}`}
            onScroll={handleScroll}
          >
            {items.map((item, i) => (
              <MovieCard
                key={item.id || i}
                item={item}
                isLarge={isLarge}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Right Arrow */}
          {(maxScroll <= 0 || scrollPos < maxScroll - 10) && (
            <button
              className="row-arrow row-arrow-right"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </button>
          )}
        </div>
      </section>

      {modalItem && (
        <MovieModal
          item={modalItem}
          onClose={() => setModalItem(null)}
        />
      )}
    </>
  );
}
