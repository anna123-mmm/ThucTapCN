var createError = require('http-errors');
var express = require('express');
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require('dotenv').config(); // Load environment variables
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        defaultLayout: 'home',
        partialsDir: path.join(__dirname, 'views' , 'partials'),
        layoutsDir: path.join(__dirname, 'views' , 'layouts'),
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        },
        helpers: {
            // Math operations
            math: function(lvalue, operator, rvalue) {
                lvalue = parseFloat(lvalue);
                rvalue = parseFloat(rvalue);
                return {
                    "+": lvalue + rvalue,
                    "-": lvalue - rvalue,
                    "*": lvalue * rvalue,
                    "/": lvalue / rvalue,
                    "%": lvalue % rvalue
                }[operator];
            },
            // Comparison helpers
            eq: function(a, b) {
                return a === b;
            },
            gt: function(a, b) {
                return a > b;
            },
            lt: function(a, b) {
                return a < b;
            },
            lte: function(a, b) {
                return a <= b;
            },
            // Ceiling function
            ceil: function(value) {
                return Math.ceil(value);
            },
            // Join array helper
            join: function(array, separator) {
                if (Array.isArray(array)) {
                    return array.join(separator || ', ');
                }
                return array || '';
            },
            // Range helper for pagination
            range: function(start, end) {
                const result = [];
                for (let i = start; i < end; i++) {
                    result.push(i);
                }
                return result;
            },
            // Concat helper for URLs
            concat: function() {
                const args = Array.prototype.slice.call(arguments, 0, -1);
                return args.join('');
            },
            // Encode URI component
            encodeURIComponent: function(str) {
                return encodeURIComponent(str || '');
            },
            // Check if array includes value
            includes: function(array, value) {
                if (Array.isArray(array)) {
                    return array.includes(value);
                }
                return false;
            },
            // Substring helper
            substring: function(str, start, end) {
                if (typeof str === 'string') {
                    return str.substring(start, end);
                }
                return str;
            },
            // Add and subtract helpers for pagination
            add: function(a, b) {
                return a + b;
            },
            subtract: function(a, b) {
                return a - b;
            },
            // Format date helper
            formatDate: function(date) {
                if (!date) return 'N/A';
                return new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            },
            // JSON helper for passing data to JavaScript
            json: function(context) {
                return JSON.stringify(context);
            }
        }
    })
);

app.use(session({
    secret: process.env.SESSION_SECRET || 'mySecret',
    resave: true,
    saveUninitialized: true,
    //cookie: { maxAge: 1000 * 60 * 60 } // 1 giờ
}));

app.use(methodOverride('_method'));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.user ? req.user.toObject() : null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error'); // Passport.js often uses 'error'
    res.locals.errors = req.flash('errors');
    next();
});

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var movieManagementRouter = require('./routes/movieManagement');
var userManagementRouter = require('./routes/userManagement');

console.log(path.join(__dirname, 'views', 'layouts'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/users', usersRouter);
app.use('/movies', moviesRouter);

//database mongo
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {Strategy: LocalStrategy} = require("passport-local");
const User = require('./models/User');
const bcryptjs = require('bcrypt');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/node') // No callback here
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch(err => {
        console.error("Error connecting to MongoDB:", err);
    });
//end mongoDB



app.post('/login', (req, res) => {
    User.findOne({email: req.body.email.toLowerCase()}).then((user) => {
        if (user) {
            bcryptjs.compare(req.body.password, user.password, async (err, matched) => {
                if(err) return err;
                if(matched){
                    // Update last login time
                    user.lastLogin = new Date();
                    await user.save();
                    
                    req.session.user = {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    };
                    res.redirect('/');
                } else {
                    res.send("Email or password is incorrect");
                }
            });
        } else {
            res.send("User does not exist");
        }
    })
});

app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: 'user',
            status: true
        });

        await newUser.save();

        // Return user info (without password)
        const userData = {
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        };

        res.status(201).json({ message: "User registered successfully", user: userData });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/register',  (req,res) => {
        console.log(req.body);
        const newUser = new User();
        newUser.name = req.body.name;
        newUser.email = req.body.email;
        newUser.password = req.body.password;
        bcryptjs.genSalt(10, function (err, salt) {
            bcryptjs.hash(newUser.password, salt, function (err, hash) {
                if (err) {return  err}
                newUser.password = hash;

                newUser.save().then(userSave=>
                {
                    res.send('USER SAVED');
                }).catch(err => {
                    res.send('USER ERROR'+err);
                });
            });
        });
    }
);

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.redirect('/'); // nếu lỗi vẫn redirect về trang chính
        }
        // Xóa cookie session
        res.clearCookie('connect.sid');
        // Sau đó redirect về login
        res.redirect('/login');
    });
});

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('blog/error');
});

module.exports = app;
