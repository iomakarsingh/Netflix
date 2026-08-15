// TMDB API Configuration
// Using TMDB API v3 with a public read access token
export const TMDB_API_KEY = '2dca580c2a14b55200e784d157207b4d';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Image sizes
export const IMG_SIZES = {
  poster: {
    sm: `${TMDB_IMAGE_BASE}/w185`,
    md: `${TMDB_IMAGE_BASE}/w342`,
    lg: `${TMDB_IMAGE_BASE}/w500`,
    xl: `${TMDB_IMAGE_BASE}/w780`,
    original: `${TMDB_IMAGE_BASE}/original`,
  },
  backdrop: {
    sm: `${TMDB_IMAGE_BASE}/w300`,
    md: `${TMDB_IMAGE_BASE}/w780`,
    lg: `${TMDB_IMAGE_BASE}/w1280`,
    original: `${TMDB_IMAGE_BASE}/original`,
  },
  profile: {
    sm: `${TMDB_IMAGE_BASE}/w45`,
    md: `${TMDB_IMAGE_BASE}/w185`,
    lg: `${TMDB_IMAGE_BASE}/h632`,
    original: `${TMDB_IMAGE_BASE}/original`,
  },
};

// TMDB Endpoints
export const ENDPOINTS = {
  // Movies
  trendingMovies: `/trending/movie/week`,
  popularMovies: `/movie/popular`,
  topRatedMovies: `/movie/top_rated`,
  upcomingMovies: `/movie/upcoming`,
  nowPlayingMovies: `/movie/now_playing`,
  movieDetails: (id) => `/movie/${id}`,
  movieVideos: (id) => `/movie/${id}/videos`,
  movieCredits: (id) => `/movie/${id}/credits`,
  movieSimilar: (id) => `/movie/${id}/similar`,
  moviesByGenre: (genreId) => `/discover/movie?with_genres=${genreId}`,

  // TV Shows
  trendingTV: `/trending/tv/week`,
  popularTV: `/tv/popular`,
  topRatedTV: `/tv/top_rated`,
  tvDetails: (id) => `/tv/${id}`,
  tvVideos: (id) => `/tv/${id}/videos`,
  tvSimilar: (id) => `/tv/${id}/similar`,
  tvsByGenre: (genreId) => `/discover/tv?with_genres=${genreId}`,

  // Netflix Originals (Netflix network_id = 213)
  netflixOriginals: `/discover/tv?with_networks=213`,
  netflixOriginalMovies: `/discover/movie?with_companies=213`,

  // Search
  search: (query) => `/search/multi?query=${encodeURIComponent(query)}`,
  searchMovies: (query) => `/search/movie?query=${encodeURIComponent(query)}`,
  searchTV: (query) => `/search/tv?query=${encodeURIComponent(query)}`,

  // Genres
  movieGenres: `/genre/movie/list`,
  tvGenres: `/genre/tv/list`,

  // Trending
  trendingAll: `/trending/all/week`,
};

// Genre IDs for quick access
export const GENRE_IDS = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  scienceFiction: 878,
  thriller: 53,
  war: 10752,
  western: 37,
  // TV Genres
  actionAdventure: 10759,
  kidsTV: 10762,
  newsTV: 10763,
  realityTV: 10764,
  scifiFantasyTV: 10765,
  soapTV: 10766,
  talkTV: 10767,
  warPoliticsTV: 10768,
};

// Fetch wrapper
export const tmdbFetch = async (endpoint, params = {}) => {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Helper to get full image URL
export const getImageUrl = (path, size = 'original', type = 'backdrop') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'w1280') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getPosterUrl = (path, size = 'w342') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};
