const Order = require('../modules/order/models/order');

exports.canAccessOrder = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findOne({ order_id: orderId });

        if (!order) {
            return res.status(404).render('error/404', {
                title: '404 - Order Not Found'
            });
        }

        // Admin có thể xem tất cả orders
        if (req.user.role === 'admin') {
            return next();
        }

        // User thường chỉ xem được order của mình
        if (order.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).render('error/403', {
                title: '403 - Access Denied'
            });
        }

        next();
    } catch (error) {
        console.error('Error in canAccessOrder middleware:', error);
        res.status(500).render('error/500', {
            title: '500 - Server Error'
        });
    }
};