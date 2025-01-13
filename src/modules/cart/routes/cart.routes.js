const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');

router.get('/cart', cartController.getCartPage);
router.post('/cart/add', cartController.addToCart);
router.get('/cart/count', cartController.getCartCount);
router.patch('/cart/update/:itemId', cartController.updateQuantity);
router.delete('/cart/remove/:itemId', cartController.removeItem);

module.exports = router;