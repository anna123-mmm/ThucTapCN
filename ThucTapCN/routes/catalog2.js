var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/catalog2', function (req, res, next) {
    res.render('catalog2');
});

module.exports = router;
