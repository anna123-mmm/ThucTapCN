var express = require('express');
//const {body} = require("express/lib/request");
var router = express.Router();
const User = require("../models/User");
const Movie = require("../models/Movie");
const Category = require("../models/category");
const bcryptjs = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

router.all('/*',(req,res, next)=>{
    res.app.locals.layout = 'home';
    next();
});

/* GET blog page. */
router.get('/', async function(req, res, next) {
  try {
    console.log('🌐 Incoming request:', req.url);
    console.log('🔍 Query params:', req.query);
    
    const searchQuery = req.query.search;
    const genreFilter = req.query.genre;
    let movies = [];
    
    // Debug log
    console.log('🔍 Parsed params:', { searchQuery, genreFilter });
    
    if (searchQuery) {
      // Search functionality
      const searchRegex = new RegExp(searchQuery, 'i');
      movies = await Movie.aggregate([
        {
          $match: {
            $or: [
              { title: searchRegex },
              { overview: searchRegex },
              { genres: { $in: [searchRegex] } }
            ]
          }
        },
        { $limit: 20 }
      ]);
      
      console.log(`🔍 Search for "${searchQuery}" found ${movies.length} results`);
    } else if (genreFilter) {
      // Filter by genre
      console.log(`🎬 Filtering by genre: "${genreFilter}"`);
      movies = await Movie.find({ genres: genreFilter })
        .sort({ rating: -1 })
        .limit(20)
        .lean();
      
      console.log(`🎬 Genre filter "${genreFilter}" found ${movies.length} results`);
      console.log(`🎬 Sample movies:`, movies.slice(0, 3).map(m => m.title));
    } else {
      // Get latest 6 movies for featured section
      const featuredMovies = await Movie.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();
      movies = featuredMovies;
    }
    
    // Get recent movies
    const recentMovies = await Movie.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();
    
    // Get popular movies (by rating) - exclude movies already in recent
    const recentMovieIds = recentMovies.map(m => m._id.toString());
    const popularMovies = await Movie.find({ 
      rating: { $exists: true, $ne: null },
      _id: { $nin: recentMovieIds }
    })
      .sort({ rating: -1 })
      .limit(12)
      .lean();
    
    // Get all unique genres for dropdown from Category model (active only)
    const categoryDocuments = await Category.find({ status: true }).sort({ name: 1 });
    const genres = categoryDocuments.map(c => c.name);
    
    res.render('partials/home/index', { 
      title: 'FlixGo - Watch Movies Online Free', 
      movies: movies,
      popularMovies,
      recentMovies,
      genres: genres,
      searchQuery: searchQuery,
      genreFilter: genreFilter,
      isSearchResult: !!(searchQuery || genreFilter)
    });
  } catch (err) {
    console.error('Error loading homepage:', err);
    // Fallback to empty arrays if database error
    res.render('partials/home/index', { 
      title: 'FlixGo - Watch Movies Online Free',
      movies: [],
      popularMovies: [],
      recentMovies: [],
      genres: [],
      searchQuery: '',
      genreFilter: '',
      isSearchResult: false
    });
  }
});

router.get('/test-genre', async function(req, res, next) {
    try {
        const genreFilter = req.query.genre;
        console.log('🧪 Test route - Genre filter:', genreFilter);
        
        if (genreFilter) {
            const movies = await Movie.find({ genres: genreFilter }).lean();
            res.json({
                success: true,
                genre: genreFilter,
                count: movies.length,
                movies: movies.map(m => ({ title: m.title, genres: m.genres }))
            });
        } else {
            const allMovies = await Movie.find().lean();
            res.json({
                success: true,
                message: 'No genre filter',
                totalMovies: allMovies.length
            });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

router.get('/signin', function(req, res, next) {
    res.render('layouts/signin');
});

router.get('/signup', function(req, res, next) {
    res.render('layouts/signup', {title: 'Register'});
});

passport.use(new LocalStrategy({usernameField: 'email'}, function (email, password, done) {
    User.findOne({email: email}).then(user => {
        if (!user)
            return done(null, false, {message: 'User not found'});

        bcryptjs.compare(password, user.password, (err, matched) => {
            if (err) return err;
            if (matched) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Wrong email or password'});
            }
        });

    });
}));

router.post('/signin', (req, res, next) => {
    // Validation
    let errors = [];
    
    if (!req.body.email || req.body.email.trim() === '') {
        errors.push({message: 'Email is required'});
    }
    
    if (!req.body.password || req.body.password.trim() === '') {
        errors.push({message: 'Password is required'});
    }
    
    // Validate email format
    if (req.body.email && !/\S+@\S+\.\S+/.test(req.body.email)) {
        errors.push({message: 'Please enter a valid email address'});
    }
    
    if (errors.length > 0) {
        return res.render('layouts/signin', {
            title: 'Sign In',
            errors: errors,
            email: req.body.email
        });
    }
    
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        
        if (!user) {
            // Xử lý các loại lỗi khác nhau
            let errorMessage = 'Login failed';
            
            if (info && info.message) {
                if (info.message === 'User not found') {
                    errorMessage = 'Email address not registered. Please sign up first.';
                } else if (info.message === 'Wrong email or password') {
                    errorMessage = 'Incorrect password. Please try again.';
                } else {
                    errorMessage = info.message;
                }
            }
            
            return res.render('layouts/signin', {
                title: 'Sign In',
                error_message: errorMessage,
                email: req.body.email
            });
        }
        
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            req.flash('success_message', 'Welcome back!');
            return res.redirect('/');
        });
    })(req, res, next);
});

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).exec();
        done(null, user); // Pass the user to the done callback
    } catch (err) {
        done(err); // Pass the error to the done callback if an error occurred
    }
});

router.get('/logout', (req, res) => {
    req.logOut((err) => {
        if (err) {
            return res.status(500).send(err); // Handle the error appropriately
        }
        res.redirect('/'); // Redirect after logout
    });
})

router.post('/signup', function(req, res, next) {
    let errors = [];
    if (!req.body.name) {
        errors.push({message: 'Name is required'});
    }
    if (!req.body.email) {
        errors.push({message: 'E-mail is required'});
    }
    if (!req.body.password) {
        errors.push({message: 'Password is required'});
    }

    if (errors.length > 0) {
        res.render('layouts/signup', {
            title: 'Signup',
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });
    } else {
        User.findOne({email: req.body.email}).then((user) => {
            if (!user) {
                const newUser = new User({
                    email: req.body.email,
                    password: req.body.password,
                    name: req.body.name,
                });
                bcryptjs.genSalt(10, function (err, salt) {
                    bcryptjs.hash(newUser.password, salt, (err, hash) => {
                        newUser.password = hash;
                        newUser.save().then(saveUser => {
                            req.flash('success_message', 'Successfully registered!');
                            res.redirect('/signin');//or /login
                        });
                    })
                })
            } else {
                req.flash('error_message', 'E-mail is exist!');
                res.redirect('/signup');
            }

        });

    }
});

module.exports = router;


router.get('/about', async function(req, res, next) {
    try {
        // Get active categories for genres dropdown
        const categoryDocuments = await Category.find({ status: true }).sort({ name: 1 });
        const genres = categoryDocuments.map(c => c.name);
        res.render('blog/about', { genres });
    } catch (error) {
        console.error('Error loading genres for about page:', error);
        res.render('blog/about', { genres: [] });
    }
});