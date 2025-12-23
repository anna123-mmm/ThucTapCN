/*
  Script: scripts/importMovies.js
  Usage: set MONGODB running, set env vars if needed (TMDB_API_KEY optional), then:
    node scripts/importMovies.js
*/

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Movie = require('../models/Movie');

const CANDIDATES = [
  'movies.csv',
  'tmdb_movies.csv',
  'data/movies.csv',
  'data/tmdb_movies.csv',
  'data/tmdb_movies_data.csv'
];

function findFile() {
  for (const f of CANDIDATES) {
    const p = path.join(__dirname, '..', f);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function safeNum(v) {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

async function run() {
  const file = findFile();
  if (!file) {
    console.error('Không tìm thấy file CSV trong các vị trí: ', CANDIDATES.join(', '));
    process.exit(1);
  }
  console.log('✅ Đã tìm thấy file:', file);

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1/node');

  const results = [];
  let totalRows = 0;

  fs.createReadStream(file)
    .pipe(csv())
    .on('data', (row) => {
      totalRows++;
      // normalize column names
      const title = row.title || row.Title || row.name || row.original_title;
      const overview = row.overview || row.Overview || row.plot || row.description || row.Overview;
      const releaseDate = row.release_date || row.releaseDate || row.ReleaseDate || row.year || row.release_year;
      const year = row.release_year ? parseInt(row.release_year) : (releaseDate ? parseInt((releaseDate+'').slice(0,4)) : null);
      const genresRaw = row.genres || row.Genres || row.genre || row.Genre || '';
      const genres = (genresRaw+'').split(/[|,]/).map(s => s && s.trim()).filter(Boolean);
      const rating = safeNum(row.vote_average || row.rating || row.imdbRating || row.Rating);
      const tmdbId = row.id || row.tmdbId || row.tmdb_id || null;

      if (!title) return; // skip

      results.push({ title, overview, releaseDate, year, genres, rating, tmdbId });
    })
    .on('end', async () => {
      console.log('\n📖 Đã đọc file CSV...');
      console.log(`📊 ${totalRows} dòng đọc được`);

      let imported = 0, skipped = 0;
      // bulk operations in chunks
      const BULK = [];
      for (const m of results) {
        let filter = {};
        if (m.tmdbId) filter = { tmdbId: m.tmdbId };
        else filter = { title: m.title, year: m.year };

        const exists = await Movie.findOne(filter).lean();
        if (exists) { skipped++; continue; }

        BULK.push({ insertOne: { document: m } });

        if (BULK.length >= 500) {
          await Movie.bulkWrite(BULK);
          imported += BULK.length;
          BULK.length = 0;
        }
      }

      if (BULK.length > 0) {
        await Movie.bulkWrite(BULK);
        imported += BULK.length;
      }

      const total = await Movie.countDocuments();

      console.log('\n💾 Đang import vào database...');
      console.log('\n═══════════════════════════════════════');
      console.log('✅ HOÀN THÀNH IMPORT!');
      console.log('═══════════════════════════════════════');
      console.log(`📥 Đã import: ${imported} phim mới`);
      console.log(`⏭️  Đã bỏ qua (trùng lặp): ${skipped} phim`);
      console.log(`📊 Tổng số phim trong database: ${total}`);
      console.log('═══════════════════════════════════════');

      process.exit(0);
    });
}

run().catch(err => { console.error(err); process.exit(1); });