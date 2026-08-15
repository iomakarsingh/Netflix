import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import MovieRow from '../components/MovieRow';
import { getBrowseData } from '../services/tmdb.service';
import { FALLBACK_BROWSE_DATA } from '../data/content';
import './BrowsePage.css';

const ROWS_CONFIG = [
  { key: 'trending',         title: '🔥 Trending Now',      isLarge: false },
  { key: 'netflixOriginals', title: 'Netflix Originals',    isLarge: true  },
  { key: 'topRated',         title: '⭐ Top Rated',         isLarge: false },
  { key: 'actionMovies',     title: 'Action & Adventure',   isLarge: false },
  { key: 'comedyMovies',     title: 'Comedies',             isLarge: false },
  { key: 'horrorMovies',     title: '🔪 Horror Movies',     isLarge: false },
  { key: 'romanticMovies',   title: 'Romantic Movies',      isLarge: false },
  { key: 'documentaries',    title: 'Documentaries',        isLarge: false },
  { key: 'popularTV',        title: 'Popular on Netflix',   isLarge: false },
  { key: 'animeTV',          title: 'Anime',                isLarge: true  },
];

export default function BrowsePage() {
  // Pre-seed with fallback data so content shows immediately — no blank skeleton
  const [data, setData]           = useState(FALLBACK_BROWSE_DATA);
  const [heroItems, setHeroItems] = useState(
    FALLBACK_BROWSE_DATA.trending.filter(i => i.backdrop_path && i.overview).slice(0, 8)
  );
  const [loading, setLoading]     = useState(false); // start false — we already have data

  useEffect(() => {
    // Attempt to upgrade to live API data in the background
    let cancelled = false;
    const upgradeTolive = async () => {
      try {
        const liveData = await getBrowseData();
        if (cancelled) return;
        setData(liveData);
        // Update hero from live trending if available
        const liveHero = liveData.trending
          ?.filter(i => i.backdrop_path && i.overview)
          ?.slice(0, 8);
        if (liveHero?.length) setHeroItems(liveHero);
      } catch {
        // Keep showing fallback — no action needed
      }
    };
    upgradeTolive();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="browse-page">
      <Header />

      {/* Hero Section */}
      <Hero items={heroItems} />

      {/* Movie Rows */}
      <div className="browse-rows">
        {ROWS_CONFIG.map(row => (
          <MovieRow
            key={row.key}
            title={row.title}
            items={data[row.key] || []}
            isLarge={row.isLarge}
            isLoading={loading}
          />
        ))}
      </div>
    </div>
  );
}
