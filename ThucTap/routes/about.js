var express = require('express');
var router = express.Router();

router.all('/*',(req,res, next)=>{
    res.app.locals.layout = 'home';
    next();
});

/* GET about page. */
router.get('/', function(req, res, next) {
  res.render('blog/about', { 
    title: 'About Us - FlixGo'
  });
});

module.exports = router;