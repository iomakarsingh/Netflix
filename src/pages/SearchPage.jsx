import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getPosterUrl, getBackdropUrl } from '../config/tmdb';
import Header from '../components/Header';
import MovieModal from '../components/MovieModal';
import {
  TRENDING, TOP_RATED, ACTION_MOVIES, COMEDY_MOVIES,
  HORROR_MOVIES, POPULAR_TV, ANIME_TV, NETFLIX_ORIGINALS,
} from '../data/content';
import './SearchPage.css';

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="169" viewBox="0 0 300 169"%3E%3Crect width="300" height="169" fill="%23181818"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23404040" font-size="14" font-family="Arial"%3ENo Image%3C/text%3E%3C/svg%3E';

// All local content combined for offline search
const ALL_LOCAL_CONTENT = [
  ...TRENDING,
  ...TOP_RATED,
  ...ACTION_MOVIES,
  ...COMEDY_MOVIES,
  ...HORROR_MOVIES,
  ...POPULAR_TV,
  ...ANIME_TV,
  ...NETFLIX_ORIGINALS,
];

// De-duplicate by id
const UNIQUE_LOCAL_CONTENT = ALL_LOCAL_CONTENT.reduce((acc, item) => {
  if (!acc.find(i => i.id === item.id)) acc.push(item);
  return acc;
}, []);

function SearchCard({ item, onClick }) {
  const [imgError, setImgError] = useState(false);
  const title = item.title || item.name || 'Unknown';
  const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const rating = item.vote_average?.toFixed(1);

  const imgUrl = item.backdrop_path
    ? getBackdropUrl(item.backdrop_path, 'w500')
    : item.poster_path
    ? getPosterUrl(item.poster_path, 'w342')
    : null;

  return (
    <div
      className="search-card"
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(item)}
      aria-label={`${title} - click for details`}
    >
      <div className="search-card-img-wrap">
        <img
          src={imgError || !imgUrl ? PLACEHOLDER : imgUrl}
          alt={title}
          className="search-card-img"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className="search-card-overlay-hover">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
      <div className="search-card-info">
        <p className="search-card-title">{title}</p>
        <div className="search-card-meta">
          {rating && rating !== '0.0' && (
            <span className="search-card-rating">★ {rating}</span>
          )}
          {year && <span className="search-card-year">{year}</span>}
          {mediaType && (
            <span className="search-card-type">
              {mediaType === 'movie' ? '🎬 Movie' : '📺 TV'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const GENRE_SUGGESTIONS = [
  { label: 'Action',      query: 'action'      },
  { label: 'Comedy',      query: 'comedy'      },
  { label: 'Horror',      query: 'horror'      },
  { label: 'Sci-Fi',      query: 'science'     },
  { label: 'Drama',       query: 'drama'       },
  { label: 'Romance',     query: 'romance'     },
  { label: 'Documentary', query: 'documentary' },
  { label: 'Anime',       query: 'anime'       },
  { label: 'Thriller',    query: 'thriller'    },
  { label: 'Adventure',   query: 'adventure'   },
  { label: 'Fantasy',     query: 'fantasy'     },
  { label: 'Crime',       query: 'crime'       },
];

// Local offline search using the fallback dataset
const localSearch = (query) => {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return UNIQUE_LOCAL_CONTENT.filter(item => {
    const title = (item.title || item.name || '').toLowerCase();
    const overview = (item.overview || '').toLowerCase();
    return title.includes(q) || overview.includes(q);
  }).slice(0, 40);
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    // First: search local content immediately
    const localResults = localSearch(query);
    setResults(localResults);

    // Then: try live API search in background
    let cancelled = false;
    const liveSearch = async () => {
      try {
        const { default: service } = await import('../services/tmdb.service.js');
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3000);
        const data = await service.searchMulti(query);
        clearTimeout(timer);
        if (cancelled) return;
        const filtered = (data.results || []).filter(r =>
          r.media_type !== 'person' && (r.poster_path || r.backdrop_path)
        );
        if (filtered.length > 0) setResults(filtered);
      } catch {
        // Keep local results
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    liveSearch();
    return () => { cancelled = true; };
  }, [query]);

  return (
    <div className="search-page">
      <Header />
      <main className="search-main">
        {!query ? (
          <div className="search-empty">
            <h2 className="search-empty-title">Search Netflix</h2>
            <p className="search-empty-sub">Browse by genre or search for a title</p>
            <div className="genre-suggestions">
              {GENRE_SUGGESTIONS.map(g => (
                <button
                  key={g.query}
                  className="genre-chip"
                  onClick={() => setSearchParams({ q: g.query })}
                  id={`genre-chip-${g.label.toLowerCase()}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="search-results-wrap">
            <div className="search-results-header">
              <h1 className="search-results-title">
                {results.length
                  ? `Results for "${query}"`
                  : loading ? 'Searching...' : `No results for "${query}"`
                }
              </h1>
              {results.length > 0 && (
                <p className="search-total">{results.length} titles found</p>
              )}
            </div>

            {results.length > 0 ? (
              <div className="search-results-grid">
                {results.map((item, i) => (
                  <SearchCard
                    key={`${item.id}-${i}`}
                    item={item}
                    onClick={setSelectedItem}
                  />
                ))}
              </div>
            ) : !loading ? (
              <div className="search-no-results">
                <p className="search-no-results-text">
                  Try a different title, genre, or topic.
                </p>
                <div className="genre-suggestions">
                  {GENRE_SUGGESTIONS.slice(0, 6).map(g => (
                    <button
                      key={g.query}
                      className="genre-chip"
                      onClick={() => setSearchParams({ q: g.query })}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="search-results-grid">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="search-card-skeleton" />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {selectedItem && (
        <MovieModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
