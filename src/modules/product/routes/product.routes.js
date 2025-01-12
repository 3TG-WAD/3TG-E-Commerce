const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.get('/products/:id', productController.getProductDetail);
router.get('/api/products/:id/reviews', productController.getReviewsPartial);
router.get('/api/products/:id/recommended', productController.getRecommendedPartial);

module.exports = router;