const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// Đảm bảo controller tồn tại trước khi sử dụng
console.log('Category Controller:', categoryController); // Debug log

// Category page route
router.get('/categories/:slug', categoryController.getCategoryPage);

// Filter API endpoint
router.post('/categories/:categoryId/filter', categoryController.filterProducts);

module.exports = router;