var express = require('express');
var router = express.Router();
const Movie = require('../models/Movie');
const Category = require('../models/category');

router.all('/*', (req, res, next) => {
    res.app.locals.layout = 'admin';
    // Disable cache for admin pages
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
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

module.exports = router;