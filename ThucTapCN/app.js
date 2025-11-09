var createError = require('http-errors');
var express = require('express');
const { engine } = require('express-handlebars')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        defaultLayout: 'layouts',
        partialsDir: path.join(__dirname, 'views', 'partials'),
        layoutsDir: path.join(__dirname, 'views', 'layouts'),
    })
);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var index2Router = require('./routes/index2');
var pricingRouter = require('./routes/pricing');
var catalog1Router = require('./routes/catalog1');
var catalog2Router = require('./routes/catalog2');
var details1Router = require('./routes/details1');
var details2Router = require('./routes/details2');
var faqRouter = require('./routes/faq');
var aboutRouter = require('./routes/about');
var signinRouter = require('./routes/signin');
var signupRouter = require('./routes/signup');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/index2', index2Router);
app.use('/pricing', pricingRouter);
app.use('/catalog1', catalog1Router);
app.use('/catalog2', catalog2Router);
app.use('/details1', details1Router);
app.use('/details2', details2Router);
app.use('/faq', faqRouter);
app.use('/about', aboutRouter);
app.use('/signin', signinRouter);
app.use('/signup', signupRouter);
app.use('/users', usersRouter);

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
  res.render('error');
});

module.exports = app;
