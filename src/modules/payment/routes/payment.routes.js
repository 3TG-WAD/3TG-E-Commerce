const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { isAuthenticated } = require('../../../middleware/auth.middleware');

router.post('/payment/create', isAuthenticated, paymentController.initiatePayment);
router.get('/payment/callback', isAuthenticated, paymentController.handlePaymentCallback);
router.get('/payment/success', isAuthenticated, (req, res) => {
    res.render('payment/success');
});
router.get('/payment/failed', isAuthenticated, (req, res) => {
    res.render('payment/failed');
});

module.exports = router;