var express = require('express');
var router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.all('/*', (req, res, next) => {
    res.app.locals.layout = 'admin';
    // Disable cache for admin pages
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// List all users
router.get('/', async function(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        
        const users = await User.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        
        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);
        
        const usersWithIndex = users.map((user, index) => ({
            ...user,
            stt: skip + index + 1,
            createdAtFormatted: new Date(user.createdAt).toLocaleDateString('vi-VN')
        }));

        res.render('admin/users/user-list', { 
            title: 'User Management',
            users: usersWithIndex,
            currentPage: page,
            totalPages: totalPages,
            totalUsers: totalUsers,
            success_message: req.flash('success_message'),
            error_message: req.flash('error_message')
        });
    } catch (err) {
        console.error('Error loading users:', err);
        req.flash('error_message', 'Error loading users');
        res.redirect('/admin');
    }
});

// Show create form
router.get('/create', async function(req, res) {
    try {
        res.render('admin/users/create', { 
            title: 'Add New User',
            error_message: req.flash('error_message')
        });
    } catch (err) {
        console.error('Error loading create form:', err);
        req.flash('error_message', 'Error loading form');
        res.redirect('/admin/users');
    }
});

// Create new user
router.post('/create', async function(req, res) {
    try {
        const { name, email, password, role, status } = req.body;
        
        // Validate required fields
        if (!name || !email) {
            req.flash('error_message', 'Tên và email là bắt buộc');
            return res.redirect('/admin/users/create');
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            req.flash('error_message', 'Email đã tồn tại');
            return res.redirect('/admin/users/create');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: role || 'user',
            status: status === 'true' || status === true
        });

        await newUser.save();
        req.flash('success_message', 'Tạo người dùng thành công');
        res.redirect('/admin/users');
    } catch (err) {
        console.error('Error creating user:', err);
        req.flash('error_message', 'Lỗi khi tạo người dùng: ' + err.message);
        res.redirect('/admin/users/create');
    }
});

// Show edit form
router.get('/edit/:id', async function(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            req.flash('error_message', 'User not found');
            return res.redirect('/admin/users');
        }

        res.render('admin/users/edit', {
            title: 'Edit User',
            user: user.toObject(),
            error_message: req.flash('error_message')
        });
    } catch (err) {
        console.error('Error loading user:', err);
        req.flash('error_message', 'Error loading user');
        res.redirect('/admin/users');
    }
});

// Update user (PUT method)
router.put('/edit/:id', async function(req, res) {
    try {
        const { name, email, password, role, status } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) {
            req.flash('error_message', 'Không tìm thấy người dùng');
            return res.redirect('/admin/users');
        }

        // Validate required fields
        if (!name || !email) {
            req.flash('error_message', 'Tên và email là bắt buộc');
            return res.redirect(`/admin/users/edit/${req.params.id}`);
        }

        // Check if email already exists (excluding current user)
        const existingUser = await User.findOne({ 
            email: email.toLowerCase(), 
            _id: { $ne: req.params.id } 
        });
        if (existingUser) {
            req.flash('error_message', 'Email đã tồn tại');
            return res.redirect(`/admin/users/edit/${req.params.id}`);
        }

        // Update user fields
        user.name = name.trim();
        user.email = email.toLowerCase().trim();
        user.role = role || 'user';
        user.status = status === 'true' || status === true;

        // Update password if provided
        if (password && password.trim() !== '') {
            user.password = await bcrypt.hash(password.trim(), 10);
        }
        
        await user.save();
        req.flash('success_message', 'Cập nhật người dùng thành công');
        res.redirect('/admin/users');
    } catch (err) {
        console.error('Error updating user:', err);
        req.flash('error_message', 'Lỗi khi cập nhật người dùng: ' + err.message);
        res.redirect(`/admin/users/edit/${req.params.id}`);
    }
});

// Update user (POST method - fallback for method override issues)
router.post('/edit/:id', async function(req, res) {
    try {
        const { name, email, password, role, status } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) {
            req.flash('error_message', 'Không tìm thấy người dùng');
            return res.redirect('/admin/users');
        }

        // Validate required fields
        if (!name || !email) {
            req.flash('error_message', 'Tên và email là bắt buộc');
            return res.redirect(`/admin/users/edit/${req.params.id}`);
        }

        // Check if email already exists (excluding current user)
        const existingUser = await User.findOne({ 
            email: email.toLowerCase(), 
            _id: { $ne: req.params.id } 
        });
        if (existingUser) {
            req.flash('error_message', 'Email đã tồn tại');
            return res.redirect(`/admin/users/edit/${req.params.id}`);
        }

        // Update user fields
        user.name = name.trim();
        user.email = email.toLowerCase().trim();
        user.role = role || 'user';
        user.status = status === 'true' || status === true;

        // Update password if provided
        if (password && password.trim() !== '') {
            user.password = await bcrypt.hash(password.trim(), 10);
        }
        
        await user.save();
        req.flash('success_message', 'Cập nhật người dùng thành công');
        res.redirect('/admin/users');
    } catch (err) {
        console.error('Error updating user:', err);
        req.flash('error_message', 'Lỗi khi cập nhật người dùng: ' + err.message);
        res.redirect(`/admin/users/edit/${req.params.id}`);
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        console.log('DELETE request received for user ID:', req.params.id);
        console.log('Request headers:', req.headers);
        
        const user = await User.findById(req.params.id);
        if (!user) {
            console.log('User not found:', req.params.id);
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);
        console.log('User deleted successfully:', req.params.id);
        
        return res.json({ success: true, message: 'Xóa người dùng thành công' });
    } catch (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ success: false, message: 'Error deleting user: ' + err.message });
    }
});

// Toggle user status
router.post('/toggle-status/:id', async (req, res) => {
    try {
        console.log('Status toggle request received for user ID:', req.params.id);
        
        const user = await User.findById(req.params.id);
        if (!user) {
            console.log('User not found for status toggle:', req.params.id);
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.status = !user.status;
        await user.save();
        
        const message = `Người dùng đã được ${user.status ? 'kích hoạt' : 'vô hiệu hóa'} thành công`;
        console.log('Status toggled successfully:', message);
        
        return res.json({ success: true, message: message });
    } catch (err) {
        console.error('Error toggling user status:', err);
        return res.status(500).json({ success: false, message: 'Error updating user status: ' + err.message });
    }
});

module.exports = router;