const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { isAuthenticated, isAdmin } = require('../../../middleware/auth.middleware');
const { canAccessOrder } = require('../../../middleware/order.middleware');

// Route cho trang purchase
router.get('/purchase', isAuthenticated, orderController.getPurchasePage);

// API endpoints
router.get('/api/orders', isAuthenticated, orderController.getOrders);
router.get('/api/orders/search', isAuthenticated, orderController.searchOrders);
router.post('/api/orders/:orderId/status', isAdmin, orderController.updateOrderStatus);
router.get('/purchase/:orderId', isAuthenticated, canAccessOrder, orderController.getOrderDetails);

module.exports = router;