var express = require('express');
var router = express.Router();
router.all('/*',(req,res, next)=>{
    res.locals.layout = 'home';
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

router.get('/test', function(req, res, next) {
    res.render('blog/test');
});

router.get('/signin', function(req, res, next) {
    res.render('layouts/signin');
});

router.get('/signup', function(req, res, next) {
    res.render('layouts/signup');
});

module.exports = router;
