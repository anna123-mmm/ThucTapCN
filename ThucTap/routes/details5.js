var express = require('express');
var router = express.Router();

/* GET blog page. */
router.get('/details5', function(req, res, next) {
    res.render('details5');
});

module.exports = router;
