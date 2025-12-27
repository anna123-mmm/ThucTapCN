var express = require('express');
var router = express.Router();

router.all('/*',(req,res, next)=>{
    res.app.locals.layout = 'signin';
    next();
});

/* GET signup page. */
router.get('/', function(req, res, next) {
  res.render('layouts/signup', { 
    title: 'Sign Up - FlixGo',
    error_message: req.flash('error_message'),
    success_message: req.flash('success_message')
  });
});

module.exports = router;