import React, { useState } from 'react';
import Header from '../components/Header';
import MovieModal from '../components/MovieModal';
import { getBackdropUrl, getPosterUrl } from '../config/tmdb';
import { useProfile } from '../contexts/ProfileContext';
import './MyListPage.css';

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="169" viewBox="0 0 300 169"%3E%3Crect width="300" height="169" fill="%23181818"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23404040" font-size="14" font-family="Arial"%3ENo Image%3C/text%3E%3C/svg%3E';

export default function MyListPage() {
  const { activeProfile, removeFromMyList } = useProfile();
  const [selectedItem, setSelectedItem] = useState(null);
  const myList = activeProfile?.myList || [];

  return (
    <div className="mylist-page">
      <Header />
      <main className="mylist-main">
        <div className="mylist-header">
          <h1 className="mylist-title">My List</h1>
          {myList.length > 0 && (
            <p className="mylist-count">{myList.length} title{myList.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        {myList.length === 0 ? (
          <div className="mylist-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <h2 className="mylist-empty-title">Your list is empty</h2>
            <p className="mylist-empty-sub">
              Add movies and TV shows to keep track of what you want to watch.
            </p>
          </div>
        ) : (
          <div className="mylist-grid">
            {myList.map((item, i) => {
              const title = item.title || item.name || 'Unknown';
              const imgUrl = item.backdrop_path
                ? getBackdropUrl(item.backdrop_path, 'w500')
                : item.poster_path
                ? getPosterUrl(item.poster_path, 'w342')
                : null;

              return (
                <div
                  key={item.id || i}
                  className="mylist-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedItem(item)}
                  onKeyDown={e => e.key === 'Enter' && setSelectedItem(item)}
                  aria-label={`${title} - click for details`}
                >
                  <div className="mylist-card-img-wrap">
                    <img
                      src={imgUrl || PLACEHOLDER}
                      alt={title}
                      className="mylist-card-img"
                      loading="lazy"
                      onError={e => { e.target.src = PLACEHOLDER; }}
                    />
                    <div className="mylist-card-hover">
                      <button
                        className="mylist-remove-btn"
                        onClick={e => { e.stopPropagation(); removeFromMyList(item.id); }}
                        aria-label={`Remove ${title} from My List`}
                        id={`remove-${item.id}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      </button>
                      <div className="mylist-card-play">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <p className="mylist-card-title">{title}</p>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedItem && (
        <MovieModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
