var express = require('express');
var router = express.Router();
const Category = require('../models/category');
const Movie = require('../models/Movie');

router.all('/*', (req, res, next) => {
    res.app.locals.layout = 'admin';
    // Disable cache for admin pages
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// List all categories/genres
router.get('/', async function(req, res) {
    try {
        const categories = await Category.find({}).sort({ createdAt: -1 });
        
        // Get movie count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category, index) => {
                const movieCount = await Movie.countDocuments({ genres: category.name });
                return {
                    ...category.toObject(),
                    stt: index + 1,
                    movieCount: movieCount
                };
            })
        );

        res.render('admin/category/category-list', { 
            title: 'Category & Genre Management',
            categories: categoriesWithCount,
            success_message: req.flash('success_message'),
            error_message: req.flash('error_message')
        });
    } catch (err) {
        console.error('Error loading categories:', err);
        req.flash('error_message', 'Lỗi tải danh sách thể loại');
        res.redirect('/admin');
    }
});

// Show create form
router.get('/create', function(req, res) {
    res.render('admin/category/create', { 
        title: 'Add New Category/Genre',
        error_message: req.flash('error_message')
    });
});

// Create new category
router.post('/create', async function(req, res) {
    try {
        const { name, description, status } = req.body;
        
        // Check if category already exists
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            req.flash('error_message', 'Thể loại/Thể loại đã tồn tại');
            return res.redirect('/admin/category/create');
        }

        const newCategory = new Category({
            name: name.trim(),
            description: description || '',
            status: status === 'true'
        });

        await newCategory.save();
        req.flash('success_message', 'Thể loại/Thể loại đã được tạo thành công');
        res.redirect('/admin/category');
    } catch (err) {
        console.error('Error creating category:', err);
        req.flash('error_message', 'Lỗi tạo thể loại');
        res.redirect('/admin/category/create');
    }
});

// Show edit form
router.get('/edit/:id', async function(req, res) {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            req.flash('error_message', 'Không tìm thấy thể loại');
            return res.redirect('/admin/category');
        }

        res.render('admin/category/edit', {
            title: 'Edit Category/Genre',
            category: category.toObject(),
            error_message: req.flash('error_message')
        });
    } catch (err) {
        console.error('Error loading category:', err);
        req.flash('error_message', 'Lỗi tải thể loại');
        res.redirect('/admin/category');
    }
});

// Update category
router.put('/edit/:id', async function(req, res) {
    try {
        const { name, description, status } = req.body;
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            req.flash('error_message', 'Không tìm thấy thể loại');
            return res.redirect('/admin/category');
        }

        // Check if new name conflicts with existing category (excluding current)
        if (name.trim() !== category.name) {
            const existingCategory = await Category.findOne({ 
                name: name.trim(),
                _id: { $ne: req.params.id }
            });
            if (existingCategory) {
                req.flash('error_message', 'Tên thể loại/thể loại đã tồn tại');
                return res.redirect(`/admin/category/edit/${req.params.id}`);
            }
        }

        // Update movies that use the old category name
        if (name.trim() !== category.name) {
            await Movie.updateMany(
                { genres: category.name },
                { $set: { "genres.$": name.trim() } }
            );
        }

        category.name = name.trim();
        category.description = description || '';
        category.status = status === 'true';
        category.updatedAt = Date.now();
        
        await category.save();
        req.flash('success_message', 'Thể loại/Thể loại đã được cập nhật thành công');
        res.redirect('/admin/category');
    } catch (err) {
        console.error('Error updating category:', err);
        req.flash('error_message', 'Lỗi cập nhật thể loại');
        res.redirect(`/admin/category/edit/${req.params.id}`);
    }
});

// Delete category
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            req.flash('error_message', 'Không tìm thấy thể loại');
            return res.redirect('/admin/category');
        }

        // Check if category is used by any movies
        const movieCount = await Movie.countDocuments({ genres: category.name });
        if (movieCount > 0) {
            req.flash('error_message', `Không thể xóa thể loại. Nó đang được sử dụng bởi ${movieCount} phim`);
            return res.redirect('/admin/category');
        }

        await Category.findByIdAndDelete(req.params.id);
        req.flash('success_message', 'Thể loại/Thể loại đã được xóa thành công');
        res.redirect('/admin/category');
    } catch (err) {
        console.error('Error deleting category:', err);
        req.flash('error_message', 'Lỗi xóa thể loại');
        res.redirect('/admin/category');
    }
});

// Toggle category status
router.post('/toggle-status/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.json({ success: false, message: 'Category not found' });
        }

        category.status = !category.status;
        category.updatedAt = Date.now();
        await category.save();

        res.json({ 
            success: true, 
            message: `Category ${category.status ? 'activated' : 'deactivated'} successfully`,
            newStatus: category.status
        });
    } catch (err) {
        console.error('Error toggling category status:', err);
        res.json({ success: false, message: 'Error updating category status' });
    }
});

module.exports = router;
