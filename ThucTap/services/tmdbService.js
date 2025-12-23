const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function searchMovie(query) {
  if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY not set');
  const res = await axios.get(`${TMDB_BASE}/search/movie`, {
    params: { api_key: TMDB_API_KEY, query }
  });
  return res.data.results || [];
}

async function getMovieVideos(tmdbId) {
  if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY not set');
  const res = await axios.get(`${TMDB_BASE}/movie/${tmdbId}/videos`, {
    params: { api_key: TMDB_API_KEY }
  });
  return res.data.results || [];
}

async function getMovieDetails(tmdbId) {
  if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY not set');
  const res = await axios.get(`${TMDB_BASE}/movie/${tmdbId}`, {
    params: { api_key: TMDB_API_KEY }
  });
  return res.data || null;
}

module.exports = {
  searchMovie,
  getMovieVideos,
  getMovieDetails
};