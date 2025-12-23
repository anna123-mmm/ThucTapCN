const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const youtubeService = require('../services/youtubeService');
const tmdbService = require('../services/tmdbService');

// Set layout for all movie routes
router.all('/*', (req, res, next) => {
  res.app.locals.layout = 'home';
  next();
});

// GET /movies - redirect to home
router.get('/', (req, res) => {
  res.redirect('/');
});

// GET /movies/:id
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send('Not found');
    res.render('blog/movie_details', { movie });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET /movies/:id/trailer - return JSON
router.get('/:id/trailer', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.json({ success: false, message: 'Not found' });

    // 1) If we have trailerId saved
    if (movie.trailerId) {
      return res.json({ success: true, videoId: movie.trailerId, url: `https://www.youtube.com/watch?v=${movie.trailerId}`, embedUrl: `https://www.youtube.com/embed/${movie.trailerId}` });
    }

    // 2) Try TMDB first (if tmdbId available)
    if (movie.tmdbId) {
      try {
        const videos = await tmdbService.getMovieVideos(movie.tmdbId);
        const yt = videos.find(v => v.site === 'YouTube' && /trailer/i.test(v.type));
        if (yt && yt.key) {
          movie.trailerId = yt.key;
          await movie.save();
          return res.json({ success: true, videoId: yt.key, url: `https://www.youtube.com/watch?v=${yt.key}`, embedUrl: `https://www.youtube.com/embed/${yt.key}` });
        }
      } catch (e) {
        // ignore tmdb errors and fallback to YouTube
        console.warn('TMDB error', e.message);
      }
    }

    // 3) Fallback to YouTube search
    const found = await youtubeService.searchTrailer(movie.title, movie.year);
    if (!found) return res.json({ success: false, message: 'Trailer not found' });

    movie.trailerId = found.videoId;
    await movie.save();

    res.json({ success: true, videoId: found.videoId, url: found.url, embedUrl: found.embedUrl, title: found.title, thumbnail: found.thumbnail });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// GET /movies/:id/watch - render page with embed
router.get('/:id/watch', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send('Not found');
    res.render('blog/movie_watch', { movie });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET /movies/:id/simple - simple test page
router.get('/:id/simple', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send('Not found');
    res.render('blog/simple_test', { movie });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;