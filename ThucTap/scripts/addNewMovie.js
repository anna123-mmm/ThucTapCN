require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');

async function addNewMovie() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/node');
    
    console.log('🎬 Adding new movie...');
    
    const newMovie = new Movie({
      title: "Dune: Part Two",
      year: 2024,
      genres: ["Action", "Adventure", "Sci-Fi"],
      rating: 8.5,
      overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
      posterPath: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      releaseDate: "2024-02-29",
      trailerId: "Way9Dexny3w", // Official Dune: Part Two trailer
      tmdbId: 693134
    });

    await newMovie.save();
    console.log('✅ Successfully added:', newMovie.title);
    console.log('📊 Movie ID:', newMovie._id);
    console.log('🔗 Watch URL: http://localhost:5000/movies/' + newMovie._id + '/watch');
    
  } catch (error) {
    console.error('❌ Error adding movie:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

addNewMovie();