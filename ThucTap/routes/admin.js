var express = require('express');
var router = express.Router();

router.all('/*',(req,res, next)=>{
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
    res.render('admin/blogwrite/blogwrite-list', { title: 'Ba viết blog' });
});

router.get('/test', (req, res) => {
    res.render('admin/test/test-file', { title: 'Test' });
});

module.exports = router;