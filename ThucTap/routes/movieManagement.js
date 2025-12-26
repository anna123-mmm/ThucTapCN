var express = require('express');
var router = express.Router();
const Movie = require('../models/Movie');
const Category = require('../models/category');
const tmdbService = require('../services/tmdbService');

router.all('/*', (req, res, next) => {
    res.app.locals.layout = 'admin';
    next();
});

// List all movies
router.get('/', async function(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        
        const movies = await Movie.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        
        const totalMovies = await Movie.countDocuments();
        const totalPages = Math.ceil(totalMovies / limit);
        
        // Add index for display
        const moviesWithIndex = movies.map((movie, index) => ({
            ...movie,
            stt: skip + index + 1
        }));

        res.render('admin/product/movie-list', { 
            title: 'Movie Management',
            movies: moviesWithIndex,
            currentPage: page,
            totalPages: totalPages,
            totalMovies: totalMovies,
            success_message: req.flash('success_message'),
            error_message: req.flash('error_message')
        });
    } catch (err) {
        console.error('Error loading movies:', err);
        req.flash('error_message', 'Lỗi tải danh sách phim');
        res.redirect('/admin');
    }
});

// Show create form
router.get('/create', async function(req, res) {
    try {
        // Get all active categories for dropdown
        const categories = await Category.find({ status: true }).sort({ name: 1 });
        
        res.render('admin/product/create', { 
            title: 'Add New Movie',
            categories: categories,
            error_message: req.flash('error_message')
        });
    } catch (err) {
        console.error('Error loading create form:', err);
        req.flash('error_message', 'Lỗi tải form');
        res.redirect('/admin/product');
    }
});

// Create new movie
router.post('/create', async function(req, res) {
    try {
        const { title, overview, year, rating, genres, poster, image, images, trailerId, tmdbId } = req.body;
        
        // Validate required fields
        if (!title || !overview) {
            req.flash('error_message', 'Tiêu đề và tóm tắt là bắt buộc');
            return res.redirect('/admin/product/create');
        }

        // Process genres (convert from array or comma-separated string)
        let genreArray = [];
        if (Array.isArray(genres)) {
            genreArray = genres.filter(g => g && g.trim() !== '');
        } else if (typeof genres === 'string') {
            genreArray = genres.split(',').map(g => g.trim()).filter(g => g !== '');
        }

        // Process additional images
        let imageArray = [];
        if (images) {
            if (Array.isArray(images)) {
                imageArray = images.filter(img => img && img.trim() !== '');
            } else if (typeof images === 'string') {
                imageArray = images.split('\n').map(img => img.trim()).filter(img => img !== '');
            }
        }

        const newMovie = new Movie({
            title: title.trim(),
            overview: overview.trim(),
            year: year ? parseInt(year) : new Date().getFullYear(),
            rating: rating ? parseFloat(rating) : 0,
            genres: genreArray,
            poster: poster ? poster.trim() : '',
            image: image ? image.trim() : '',
            images: imageArray,
            trailerId: trailerId ? trailerId.trim() : '',
            tmdbId: tmdbId ? parseInt(tmdbId) : null
        });

        await newMovie.save();
        req.flash('success_message', 'Phim đã được tạo thành công');
        res.redirect('/admin/product');
    } catch (err) {
        console.error('Error creating movie:', err);
        req.flash('error_message', 'Lỗi tạo phim: ' + err.message);
        res.redirect('/admin/product/create');
    }
});

// Show edit form
router.get('/edit/:id', async function(req, res) {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            req.flash('error_message', 'Không tìm thấy phim');
            return res.redirect('/admin/product');
        }

        // Get all active categories for dropdown
        const categories = await Category.find({ status: true }).sort({ name: 1 });

        res.render('admin/product/edit', {
            title: 'Edit Movie',
            movie: movie.toObject(),
            categories: categories,
            error_message: req.flash('error_message')
        });
    } catch (err) {
        console.error('Error loading movie:', err);
        req.flash('error_message', 'Lỗi tải phim');
        res.redirect('/admin/product');
    }
});

// Update movie
router.put('/edit/:id', async function(req, res) {
    try {
        const { title, overview, year, rating, genres, poster, image, images, trailerId, tmdbId } = req.body;
        
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            req.flash('error_message', 'Movie not found');
            return res.redirect('/admin/product');
        }

        // Validate required fields
        if (!title || !overview) {
            req.flash('error_message', 'Tiêu đề và tóm tắt là bắt buộc');
            return res.redirect(`/admin/product/edit/${req.params.id}`);
        }

        // Process genres
        let genreArray = [];
        if (Array.isArray(genres)) {
            genreArray = genres.filter(g => g && g.trim() !== '');
        } else if (typeof genres === 'string') {
            genreArray = genres.split(',').map(g => g.trim()).filter(g => g !== '');
        }

        // Process additional images
        let imageArray = [];
        if (images) {
            if (Array.isArray(images)) {
                imageArray = images.filter(img => img && img.trim() !== '');
            } else if (typeof images === 'string') {
                imageArray = images.split('\n').map(img => img.trim()).filter(img => img !== '');
            }
        }

        // Update movie fields
        movie.title = title.trim();
        movie.overview = overview.trim();
        movie.year = year ? parseInt(year) : movie.year;
        movie.rating = rating ? parseFloat(rating) : movie.rating;
        movie.genres = genreArray;
        movie.poster = poster ? poster.trim() : movie.poster;
        movie.image = image ? image.trim() : movie.image;
        movie.images = imageArray;
        movie.trailerId = trailerId ? trailerId.trim() : movie.trailerId;
        movie.tmdbId = tmdbId ? parseInt(tmdbId) : movie.tmdbId;
        
        await movie.save();
        req.flash('success_message', 'Phim đã được cập nhật thành công');
        res.redirect('/admin/product');
    } catch (err) {
        console.error('Error updating movie:', err);
        req.flash('error_message', 'Lỗi cập nhật phim: ' + err.message);
        res.redirect(`/admin/product/edit/${req.params.id}`);
    }
});

// Delete movie
router.delete('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            req.flash('error_message', 'Không tìm thấy phim');
            return res.redirect('/admin/product');
        }

        await Movie.findByIdAndDelete(req.params.id);
        req.flash('success_message', 'Phim đã được xóa thành công');
        res.redirect('/admin/product');
    } catch (err) {
        console.error('Error deleting movie:', err);
        req.flash('error_message', 'Lỗi xóa phim');
        res.redirect('/admin/product');
    }
});

// Search TMDB for movie data
router.get('/search-tmdb', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.json({ success: false, message: 'Search query required' });
        }

        // Check if TMDB API key is configured
        if (!process.env.TMDB_API_KEY || process.env.TMDB_API_KEY === 'your_tmdb_api_key_here') {
            // Return demo data for testing
            const demoMovies = [
                {
                    id: 264660,
                    title: "Ex Machina",
                    overview: "Caleb, a coder at the world's largest internet company, wins a competition to spend a week at a private mountain retreat belonging to Nathan, the reclusive CEO of the company. But when Caleb arrives at the remote location he finds that he will have to participate in a strange and fascinating experiment in which he must interact with the world's first true artificial intelligence, housed in the body of a beautiful robot girl.",
                    year: 2014,
                    rating: 7.7,
                    poster: "https://image.tmdb.org/t/p/w500/btTdmkgIvOi0FFip1sPuZI2oQG6.jpg",
                    backdrop: "https://image.tmdb.org/t/p/w1280/8Z8dptJEypuLoOQro1WugD855YE.jpg",
                    genres: ["Drama", "Sci-Fi", "Thriller"],
                    releaseDate: "2014-12-16"
                },
                {
                    id: 680,
                    title: "Pulp Fiction",
                    overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.",
                    year: 1994,
                    rating: 8.9,
                    poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
                    backdrop: "https://image.tmdb.org/t/p/w1280/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg",
                    genres: ["Crime", "Drama"],
                    releaseDate: "1994-10-14"
                },
                {
                    id: 13,
                    title: "Forrest Gump",
                    overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do. But despite all he has achieved, his one true love eludes him.",
                    year: 1994,
                    rating: 8.8,
                    poster: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
                    backdrop: "https://image.tmdb.org/t/p/w1280/7c9UVPPiTPltouxRVY6N9ZX5ece.jpg",
                    genres: ["Comedy", "Drama", "Romance"],
                    releaseDate: "1994-07-06"
                },
                {
                    id: 299536,
                    title: "Avengers: Infinity War",
                    overview: "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos.",
                    year: 2018,
                    rating: 8.3,
                    poster: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
                    backdrop: "https://image.tmdb.org/t/p/w1280/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg",
                    genres: ["Action", "Adventure", "Sci-Fi"],
                    releaseDate: "2018-04-25"
                },
                {
                    id: 299534,
                    title: "Avengers: Endgame", 
                    overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos.",
                    year: 2019,
                    rating: 8.4,
                    poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
                    backdrop: "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
                    genres: ["Action", "Adventure", "Drama"],
                    releaseDate: "2019-04-24"
                },
                {
                    id: 550,
                    title: "Fight Club",
                    overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground \"fight clubs\" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.",
                    year: 1999,
                    rating: 8.8,
                    poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                    backdrop: "https://image.tmdb.org/t/p/w1280/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
                    genres: ["Drama"],
                    releaseDate: "1999-10-15"
                },
                {
                    id: 157336,
                    title: "Interstellar",
                    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
                    year: 2014,
                    rating: 8.6,
                    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                    backdrop: "https://image.tmdb.org/t/p/w1280/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
                    genres: ["Adventure", "Drama", "Sci-Fi"],
                    releaseDate: "2014-11-07"
                },
                {
                    id: 27205,
                    title: "Inception",
                    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
                    year: 2010,
                    rating: 8.8,
                    poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
                    backdrop: "https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
                    genres: ["Action", "Sci-Fi", "Thriller"],
                    releaseDate: "2010-07-16"
                },
                {
                    id: 155,
                    title: "The Dark Knight",
                    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
                    year: 2008,
                    rating: 9.0,
                    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                    backdrop: "https://image.tmdb.org/t/p/w1280/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
                    genres: ["Action", "Crime", "Drama"],
                    releaseDate: "2008-07-18"
                },
                {
                    id: 603,
                    title: "The Matrix",
                    overview: "Set in the 22nd century, The Matrix tells the story of a computer programmer who is led to fight an underground war against powerful computers who have constructed his entire reality with a system called the Matrix.",
                    year: 1999,
                    rating: 8.7,
                    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
                    backdrop: "https://image.tmdb.org/t/p/w1280/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",
                    genres: ["Action", "Sci-Fi"],
                    releaseDate: "1999-03-31"
                }
            ].filter(movie => movie.title.toLowerCase().includes(query.toLowerCase()));

            return res.json({ 
                success: true, 
                movies: demoMovies,
                demo: true,
                message: 'Demo data - Configure TMDB_API_KEY in .env for real data'
            });
        }

        const movies = await tmdbService.searchMovie(query);
        
        // Format results for frontend
        const formattedMovies = movies.slice(0, 10).map(movie => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
            rating: movie.vote_average,
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
            genres: movie.genre_ids || [],
            releaseDate: movie.release_date
        }));

        res.json({ success: true, movies: formattedMovies });
    } catch (err) {
        console.error('Error searching TMDB:', err);
        res.json({ success: false, message: 'Error searching TMDB: ' + err.message });
    }
});

// Get detailed movie data from TMDB
router.get('/tmdb-details/:id', async (req, res) => {
    try {
        const tmdbId = req.params.id;
        
        // Check if TMDB API key is configured
        if (!process.env.TMDB_API_KEY || process.env.TMDB_API_KEY === 'your_tmdb_api_key_here') {
            // Return demo data for testing
            const demoMovieData = {
                264660: {
                    tmdbId: 264660,
                    title: "Ex Machina",
                    overview: "Caleb, a coder at the world's largest internet company, wins a competition to spend a week at a private mountain retreat belonging to Nathan, the reclusive CEO of the company. But when Caleb arrives at the remote location he finds that he will have to participate in a strange and fascinating experiment in which he must interact with the world's first true artificial intelligence, housed in the body of a beautiful robot girl.",
                    year: 2014,
                    rating: 7.7,
                    genres: ["Drama", "Sci-Fi", "Thriller"],
                    poster: "https://image.tmdb.org/t/p/w500/btTdmkgIvOi0FFip1sPuZI2oQG6.jpg",
                    image: "https://image.tmdb.org/t/p/w1280/8Z8dptJEypuLoOQro1WugD855YE.jpg",
                    trailerId: "XYGzRB4Pnq8",
                    releaseDate: "2014-12-16",
                    images: [
                        "https://image.tmdb.org/t/p/w780/btTdmkgIvOi0FFip1sPuZI2oQG6.jpg",
                        "https://image.tmdb.org/t/p/original/8Z8dptJEypuLoOQro1WugD855YE.jpg"
                    ]
                },
                680: {
                    tmdbId: 680,
                    title: "Pulp Fiction",
                    overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.",
                    year: 1994,
                    rating: 8.9,
                    genres: ["Crime", "Drama"],
                    poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
                    image: "https://image.tmdb.org/t/p/w1280/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg",
                    trailerId: "s7EdQ4FqbhY",
                    releaseDate: "1994-10-14",
                    images: [
                        "https://image.tmdb.org/t/p/w780/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
                        "https://image.tmdb.org/t/p/original/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg"
                    ]
                },
                13: {
                    tmdbId: 13,
                    title: "Forrest Gump",
                    overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do. But despite all he has achieved, his one true love eludes him.",
                    year: 1994,
                    rating: 8.8,
                    genres: ["Comedy", "Drama", "Romance"],
                    poster: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
                    image: "https://image.tmdb.org/t/p/w1280/7c9UVPPiTPltouxRVY6N9ZX5ece.jpg",
                    trailerId: "bLvqoHBptjg",
                    releaseDate: "1994-07-06",
                    images: [
                        "https://image.tmdb.org/t/p/w780/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
                        "https://image.tmdb.org/t/p/original/7c9UVPPiTPltouxRVY6N9ZX5ece.jpg"
                    ]
                },
                550: {
                    tmdbId: 550,
                    title: "Fight Club",
                    overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground \"fight clubs\" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.",
                    year: 1999,
                    rating: 8.8,
                    genres: ["Drama"],
                    poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                    image: "https://image.tmdb.org/t/p/w1280/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
                    trailerId: "qtRKdVHc-cE",
                    releaseDate: "1999-10-15",
                    images: [
                        "https://image.tmdb.org/t/p/w780/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                        "https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg"
                    ]
                },
                157336: {
                    tmdbId: 157336,
                    title: "Interstellar",
                    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
                    year: 2014,
                    rating: 8.6,
                    genres: ["Adventure", "Drama", "Sci-Fi"],
                    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                    image: "https://image.tmdb.org/t/p/w1280/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
                    trailerId: "zSWdZVtXT7E",
                    releaseDate: "2014-11-07",
                    images: [
                        "https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                        "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg"
                    ]
                },
                299536: {
                    tmdbId: 299536,
                    title: "Avengers: Infinity War",
                    overview: "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos. A despot of intergalactic infamy, his goal is to collect all six Infinity Stones, artifacts of unimaginable power, and use them to inflict his twisted will on all of reality.",
                    year: 2018,
                    rating: 8.3,
                    genres: ["Action", "Adventure", "Sci-Fi"],
                    poster: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
                    image: "https://image.tmdb.org/t/p/w1280/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg",
                    trailerId: "6ZfuNTqbHE8",
                    releaseDate: "2018-04-25",
                    images: [
                        "https://image.tmdb.org/t/p/w780/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
                        "https://image.tmdb.org/t/p/original/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg"
                    ]
                },
                299534: {
                    tmdbId: 299534,
                    title: "Avengers: Endgame",
                    overview: "After the devastating events of Avengers: Infinity War (2018), the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store.",
                    year: 2019,
                    rating: 8.4,
                    genres: ["Action", "Adventure", "Drama"],
                    poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
                    image: "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
                    trailerId: "TcMBFSGVi1c",
                    releaseDate: "2019-04-24",
                    images: [
                        "https://image.tmdb.org/t/p/w780/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
                        "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg"
                    ]
                }
            };

            const movieData = demoMovieData[tmdbId];
            if (movieData) {
                return res.json({ 
                    success: true, 
                    movie: movieData,
                    demo: true,
                    message: 'Demo data - Configure TMDB_API_KEY in .env for real data'
                });
            } else {
                return res.json({ success: false, message: 'Demo movie not found' });
            }
        }

        // Get movie details and videos
        const [movieDetails, videos] = await Promise.all([
            tmdbService.getMovieDetails(tmdbId),
            tmdbService.getMovieVideos(tmdbId)
        ]);

        if (!movieDetails) {
            return res.json({ success: false, message: 'Movie not found' });
        }

        // Find YouTube trailer
        const trailer = videos.find(video => 
            video.site === 'YouTube' && 
            (video.type === 'Trailer' || video.type === 'Teaser')
        );

        // Format response
        const movieData = {
            tmdbId: movieDetails.id,
            title: movieDetails.title,
            overview: movieDetails.overview,
            year: movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : null,
            rating: movieDetails.vote_average,
            genres: movieDetails.genres ? movieDetails.genres.map(g => g.name) : [],
            poster: movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : '',
            image: movieDetails.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}` : '',
            trailerId: trailer ? trailer.key : '',
            releaseDate: movieDetails.release_date,
            // Additional images from TMDB
            images: []
        };

        // Add additional poster sizes as extra images
        if (movieDetails.poster_path) {
            movieData.images.push(`https://image.tmdb.org/t/p/w780${movieDetails.poster_path}`);
        }
        if (movieDetails.backdrop_path) {
            movieData.images.push(`https://image.tmdb.org/t/p/original${movieDetails.backdrop_path}`);
        }

        res.json({ success: true, movie: movieData });
    } catch (err) {
        console.error('Error getting TMDB details:', err);
        res.json({ success: false, message: 'Error getting movie details: ' + err.message });
    }
});

module.exports = router;