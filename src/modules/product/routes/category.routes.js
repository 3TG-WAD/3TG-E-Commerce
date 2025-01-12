const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// Đảm bảo controller tồn tại trước khi sử dụng
console.log('Category Controller:', categoryController);

// Category page route
router.get('/categories/:slug', categoryController.getCategoryPage);

// Filter API endpoint
router.post('/categories/:categoryId/filter', categoryController.filterProducts);

// Sort API endpoint
router.get('/categories/:categoryId/sort', categoryController.sortProducts);

module.exports = router;
