const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { isAuthenticated } = require('../../../middleware/auth.middleware');
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    },
});

router.get('/products/:id', productController.getProductDetail);
router.get('/api/products/:id/reviews', productController.getReviewsPartial);
router.get('/api/products/:id/recommended', productController.getRecommendedPartial);
router.post('/api/products/:id/reviews', isAuthenticated, productController.addReview);
router.post('/api/reviews/upload-images', isAuthenticated, upload.array('images', 5), productController.uploadImages);

module.exports = router;