const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');

router.get('/cart', cartController.getCartPage);
router.post('/cart/add', cartController.addToCart);
router.patch('/cart/quantity/:item_id', cartController.updateQuantity);
router.delete('/cart/remove/:item_id', cartController.removeItem);
router.get('/cart/count', cartController.getCartCount);

module.exports = router;