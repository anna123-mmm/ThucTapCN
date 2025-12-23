require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const tmdb = require('../services/tmdbService');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1/node';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchForMovie(movie) {
  try {
    console.log(`→ Checking: ${movie.title} (tmdbId: ${movie.tmdbId || 'N/A'})`);
    if (movie.tmdbId) {
      const details = await tmdb.getMovieDetails(movie.tmdbId);
      if (details && details.poster_path) {
        movie.posterPath = details.poster_path;
        await movie.save();
        console.log(`  ✓ poster found via tmdb details: ${details.poster_path}`);
        return { ok: true, source: 'tmdb-details' };
      }
    }

    // fallback: search by title
    if (movie.title) {
      const results = await tmdb.searchMovie(movie.title);
      if (results && results.length) {
        // try best match by year
        let picked = results[0];
        if (movie.year) {
          const byYear = results.find(r => r.release_date && r.release_date.startsWith(String(movie.year)));
          if (byYear) picked = byYear;
        }
        if (picked.poster_path) {
          movie.posterPath = picked.poster_path;
          // if picked has id but movie doesn't, set tmdbId
          if (!movie.tmdbId && picked.id) movie.tmdbId = picked.id;
          await movie.save();
          console.log(`  ✓ poster found via search: ${picked.poster_path} (picked id ${picked.id})`);
          return { ok: true, source: 'tmdb-search' };
        } else {
          console.log('  ✗ search returned results but no poster_path');
        }
      } else {
        console.log('  ✗ no search results');
      }
    }

    return { ok: false, reason: 'no poster found' };
  } catch (err) {
    console.error(`  Error for ${movie.title}:`, err.message);
    return { ok: false, reason: err.message };
  }
}

async function run() {
  console.log('🔎 Connecting to', MONGO);
  await mongoose.connect(MONGO);
  console.log('✅ Mongo connected');

  const cursor = Movie.find({ $or: [{ posterPath: { $exists: false } }, { posterPath: null }] }).cursor();
  let updated = 0;
  let checked = 0;

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    checked++;
    const res = await fetchForMovie(doc);
    if (res.ok) updated++;
    if (checked % 20 === 0) console.log(`Checked ${checked}, updated ${updated}`);
    // be polite to TMDB
    await sleep(250);
  }

  console.log(`Finished. Checked ${checked}, updated ${updated}`);
  mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });