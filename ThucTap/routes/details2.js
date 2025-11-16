var express = require('express');
var router = express.Router();

/* GET blog page. */
router.get('/details2', function(req, res, next) {
    res.render('details2');
});

module.exports = router;
