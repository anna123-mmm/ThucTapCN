const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  overview: String,
  releaseDate: String,
  year: Number,
  genres: [String],
  rating: Number,
  trailerId: String,
  tmdbId: String, // nếu có từ TMDB CSV
  posterPath: String, // TMDB poster_path (e.g. /abc123.jpg)
}, { timestamps: true });

module.exports = mongoose.model('Movie', MovieSchema);