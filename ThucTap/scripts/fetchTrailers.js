require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const tmdb = require('../services/tmdbService');
const youtube = require('../services/youtubeService');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1/node';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchForMovie(movie) {
  try {
    console.log(`→ Checking: ${movie.title} (tmdbId: ${movie.tmdbId || 'N/A'})`);
    // 1) TMDB videos
    if (movie.tmdbId) {
      try {
        const videos = await tmdb.getMovieVideos(movie.tmdbId);
        const yt = videos.find(v => v.site === 'YouTube' && /trailer/i.test(v.type));
        if (yt && yt.key) {
          movie.trailerId = yt.key;
          await movie.save();
          console.log(`  ✓ trailer found via TMDB: ${yt.key}`);
          return { ok: true, source: 'tmdb' };
        }
      } catch (e) {
        console.warn('  TMDB error', e.message);
      }
    }

    // 2) YouTube search (if key present)
    try {
      const found = await youtube.searchTrailer(movie.title, movie.year);
      if (found && found.videoId) {
        movie.trailerId = found.videoId;
        await movie.save();
        console.log(`  ✓ trailer found via YouTube: ${found.videoId}`);
        return { ok: true, source: 'youtube' };
      }
      console.log('  ✗ no YouTube result');
    } catch (e) {
      console.warn('  YouTube search failed:', e.message);
    }

    return { ok: false, reason: 'not found' };
  } catch (err) {
    console.error(`  Error for ${movie.title}:`, err.message);
    return { ok: false, reason: err.message };
  }
}

async function run() {
  console.log('🔎 Connecting to', MONGO);
  await mongoose.connect(MONGO);
  console.log('✅ Mongo connected');

  const cursor = Movie.find({ trailerId: { $exists: false } }).cursor();
  let updated = 0;
  let checked = 0;

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    checked++;
    const res = await fetchForMovie(doc);
    if (res.ok) updated++;
    if (checked % 20 === 0) console.log(`Checked ${checked}, updated ${updated}`);
    await sleep(500);
  }

  console.log(`Finished. Checked ${checked}, updated ${updated}`);
  mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });