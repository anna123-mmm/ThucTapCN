var express = require('express');
var router = express.Router();

/* GET blog page. */
router.get('/details4', function(req, res, next) {
    res.render('details4');
});

module.exports = router;
