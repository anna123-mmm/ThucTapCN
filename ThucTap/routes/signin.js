var express = require('express');
var router = express.Router();

/* GET blog page. */
router.get('/signin', function(req, res, next) {
    res.render('signin');
});

module.exports = router;
