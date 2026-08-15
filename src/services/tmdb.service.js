import { tmdbFetch, ENDPOINTS } from '../config/tmdb';
import { FALLBACK_BROWSE_DATA } from '../data/content';

// ==========================================
// TIMEOUT WRAPPER — fail fast if no network
// ==========================================
const withTimeout = (promise, ms = 2000) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), ms)
  );
  return Promise.race([promise, timeout]);
};

// ==========================================
// MOVIE SERVICES
// ==========================================

export const getTrendingMovies = (page = 1) =>
  tmdbFetch(ENDPOINTS.trendingMovies, { page });

export const getPopularMovies = (page = 1) =>
  tmdbFetch(ENDPOINTS.popularMovies, { page });

export const getTopRatedMovies = (page = 1) =>
  tmdbFetch(ENDPOINTS.topRatedMovies, { page });

export const getUpcomingMovies = (page = 1) =>
  tmdbFetch(ENDPOINTS.upcomingMovies, { page });

export const getNowPlayingMovies = (page = 1) =>
  tmdbFetch(ENDPOINTS.nowPlayingMovies, { page });

export const getMovieDetails = (id) =>
  tmdbFetch(ENDPOINTS.movieDetails(id), { append_to_response: 'videos,credits,similar,images' });

export const getMovieVideos = (id) =>
  tmdbFetch(ENDPOINTS.movieVideos(id));

export const getMovieCredits = (id) =>
  tmdbFetch(ENDPOINTS.movieCredits(id));

export const getSimilarMovies = (id, page = 1) =>
  tmdbFetch(ENDPOINTS.movieSimilar(id), { page });

export const getMoviesByGenre = (genreId, page = 1) =>
  tmdbFetch(`/discover/movie`, { with_genres: genreId, page, sort_by: 'popularity.desc' });

// ==========================================
// TV SHOW SERVICES
// ==========================================

export const getTrendingTV = (page = 1) =>
  tmdbFetch(ENDPOINTS.trendingTV, { page });

export const getPopularTV = (page = 1) =>
  tmdbFetch(ENDPOINTS.popularTV, { page });

export const getTopRatedTV = (page = 1) =>
  tmdbFetch(ENDPOINTS.topRatedTV, { page });

export const getTVDetails = (id) =>
  tmdbFetch(ENDPOINTS.tvDetails(id), { append_to_response: 'videos,credits,similar' });

export const getNetflixOriginals = (page = 1) =>
  tmdbFetch('/discover/tv', { with_networks: 213, page, sort_by: 'popularity.desc' });

export const getTVsByGenre = (genreId, page = 1) =>
  tmdbFetch('/discover/tv', { with_genres: genreId, page, sort_by: 'popularity.desc' });

// ==========================================
// SEARCH SERVICES
// ==========================================

export const searchMulti = (query, page = 1) =>
  tmdbFetch('/search/multi', { query, page });

export const searchMovies = (query, page = 1) =>
  tmdbFetch('/search/movie', { query, page });

export const searchTV = (query, page = 1) =>
  tmdbFetch('/search/tv', { query, page });

// ==========================================
// TRENDING & DISCOVER
// ==========================================

export const getTrendingAll = async (timeWindow = 'week', page = 1) => {
  try {
    const data = await withTimeout(
      tmdbFetch(`/trending/all/${timeWindow}`, { page }),
      2000
    );
    return data;
  } catch {
    // Return fallback trending as mock response
    return { results: FALLBACK_BROWSE_DATA.trending, total_pages: 1, total_results: FALLBACK_BROWSE_DATA.trending.length };
  }
};

export const discoverMovies = (params = {}) =>
  tmdbFetch('/discover/movie', { sort_by: 'popularity.desc', ...params });

export const discoverTV = (params = {}) =>
  tmdbFetch('/discover/tv', { sort_by: 'popularity.desc', ...params });

// ==========================================
// GENRE SERVICES
// ==========================================

export const getMovieGenres = () => tmdbFetch('/genre/movie/list');
export const getTVGenres = () => tmdbFetch('/genre/tv/list');

// ==========================================
// COMBINED FETCH FOR BROWSE PAGE
// with automatic fallback to local data
// ==========================================

const tryFetch = async (fetchFn, fallbackKey) => {
  try {
    const data = await withTimeout(fetchFn(), 2000);
    if (data?.results?.length > 0) return data.results;
    throw new Error('Empty results');
  } catch {
    return FALLBACK_BROWSE_DATA[fallbackKey] || [];
  }
};

export const getBrowseData = async () => {
  const [
    trending,
    netflixOriginals,
    topRated,
    actionMovies,
    comedyMovies,
    horrorMovies,
    romanticMovies,
    documentaries,
    animeTV,
    popularTV,
  ] = await Promise.all([
    tryFetch(() => tmdbFetch('/trending/all/week'), 'trending'),
    tryFetch(() => tmdbFetch('/discover/tv', { with_networks: 213, sort_by: 'popularity.desc' }), 'netflixOriginals'),
    tryFetch(() => tmdbFetch('/movie/top_rated'), 'topRated'),
    tryFetch(() => tmdbFetch('/discover/movie', { with_genres: 28, sort_by: 'popularity.desc' }), 'actionMovies'),
    tryFetch(() => tmdbFetch('/discover/movie', { with_genres: 35, sort_by: 'popularity.desc' }), 'comedyMovies'),
    tryFetch(() => tmdbFetch('/discover/movie', { with_genres: 27, sort_by: 'popularity.desc' }), 'horrorMovies'),
    tryFetch(() => tmdbFetch('/discover/movie', { with_genres: 10749, sort_by: 'popularity.desc' }), 'romanticMovies'),
    tryFetch(() => tmdbFetch('/discover/movie', { with_genres: 99, sort_by: 'popularity.desc' }), 'documentaries'),
    tryFetch(() => tmdbFetch('/discover/tv', { with_genres: 16, sort_by: 'popularity.desc' }), 'animeTV'),
    tryFetch(() => tmdbFetch('/tv/popular'), 'popularTV'),
  ]);

  return {
    trending,
    netflixOriginals,
    topRated,
    actionMovies,
    comedyMovies,
    horrorMovies,
    romanticMovies,
    documentaries,
    animeTV,
    popularTV,
  };
};
