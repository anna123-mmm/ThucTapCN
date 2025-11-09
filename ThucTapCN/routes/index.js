var express = require('express');
var router = express.Router();

/* GET home page. */
router.all('/*', function (req, res, next) {
    res.app.locals.layout='home';
    next();
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/index2', function(req, res, next) {
    res.render('home/index2', { title: 'Home' });
});

router.get('/pricing', function(req, res, next) {
    res.render('home/pricing', { title: 'Home' });
});

router.get('/catalog1', function(req, res, next) {
    res.render('home/catalog1', { title: 'Home' });
});

router.get('/catalog2', function(req, res, next) {
    res.render('home/catalog2', { title: 'Home' });
});

router.get('/details1', function(req, res, next) {
    res.render('home/details1', { title: 'Home' });
});

router.get('/details2', function(req, res, next) {
    res.render('home/details2', { title: 'Home' });
});

router.get('/faq', function(req, res, next) {
    res.render('home/faq', { title: 'Home' });
});

router.get('/about', function(req, res, next) {
    res.render('home/about', { title: 'Home' });
});

router.get('/signin', function(req, res, next) {
    res.render('home/signin', { title: 'Home' });
});

router.get('/signup', function(req, res, next) {
    res.render('home/signup', { title: 'Home' });
});

module.exports = router;
