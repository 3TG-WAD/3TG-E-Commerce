const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { isAuthenticated } = require('../../../middleware/auth.middleware');

router.get('/products/:id', productController.getProductDetail);
router.get('/api/products/:id/reviews', productController.getReviewsPartial);
router.get('/api/products/:id/recommended', productController.getRecommendedPartial);
router.post('/api/products/:id/reviews', isAuthenticated, productController.addReview);

module.exports = router;