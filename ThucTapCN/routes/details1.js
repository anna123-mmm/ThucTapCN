var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/details1', function (req, res, next) {
    res.render('details1');
});

module.exports = router;
