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

router.get('/category', (req, res) => {
    res.render('admin/category/category-list', { title: 'Quản lý thể loại' });
});

router.get('/product', (req, res) => {
    res.render('admin/product/product-list', { title: 'Quản lý phim' });
});

router.get('/blogwrite', (req, res) => {
    res.render('admin/blogwrite/blogwrite-list', { title: 'Bai viết blog' });
});

router.get('/test', (req, res) => {
    res.render('admin/test/test-file', { title: 'Test' });
});

router.get('/users', (req, res) => {
    res.render('admin/users/user-list', { title: 'Quản lý người dùng' });
});

module.exports = router;