const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { isAuthenticated } = require('../../../middleware/auth.middleware');

// Route cho trang purchase
router.get('/purchase', isAuthenticated, orderController.getPurchasePage);

// API endpoints
router.get('/api/orders', isAuthenticated, orderController.getOrders);
router.get('/api/orders/search', isAuthenticated, orderController.searchOrders);
router.post('/api/orders/:orderId/status', isAuthenticated, orderController.updateOrderStatus);
router.get('/purchase/:orderId', orderController.getOrderDetails);
module.exports = router;