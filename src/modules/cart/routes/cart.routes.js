const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');

router.get('/cart', cartController.getCartPage);

module.exports = router;