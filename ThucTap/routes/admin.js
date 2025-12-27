var express = require('express');
var router = express.Router();

/*function useAuthenticated(req, res, next) {
   if (req.isAuthenticated()) {
        return next(); // Proceed if authenticated
    } else {
        res.redirect('/signin'); // Redirect to login if authentication fails
    }
}
*/

router.all('/*' /*, useAuthenticated*/, (req, res, next) => {
    res.locals.layout = 'admin';
    next();
});

router.get('/', (req,res)=> {
    res.render('admin/index', {title: 'Bảng đều khiển Admin'});
});

module.exports = router;