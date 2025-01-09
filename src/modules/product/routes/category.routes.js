const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

router.get('/categories/:slug', categoryController.getCategoryPage);
router.get('/categories', categoryController.getAllCategories);
router.post('/api/products/search', categoryController.searchProducts);

module.exports = router;