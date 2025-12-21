var express = require('express');
//const {body} = require("express/lib/request");
var router = express.Router();
const User = require("../models/User");
const bcryptjs = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

router.all('/*',(req,res, next)=>{
    res.app.locals.layout = 'home';
    next();
});

/* GET blog page. */
router.get('/', function(req, res, next) {
  res.render('partials/home/index', { title: 'Express' });
});

router.get('/pricing', function(req, res, next) {
    res.render('blog/pricing');
});

router.get('/about', function(req, res, next) {
    res.render('blog/about');
});

router.get('/details2', function(req, res, next) {
    res.render('blog/details2');
});

router.get('/details3', function(req, res, next) {
    res.render('blog/details3');
});

router.get('/details4', function(req, res, next) {
    res.render('blog/details4');
});

router.get('/details5', function(req, res, next) {
    res.render('blog/details5');
});

router.get('/test', function(req, res, next) {
    res.render('blog/test');
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
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/signin',
        failureFlash: true
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


