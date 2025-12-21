var express = require('express');
var router = express.Router();

/* GET blog page. */
router.get('/details3', function(req, res, next) {
    res.render('details3');
});

module.exports = router;
