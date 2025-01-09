const orderService = require('../services/order.service');

class OrderController {
    // Render trang purchase
    async getPurchasePage(req, res) {
        try {
            const { status } = req.query;
            const orders = await orderService.getOrdersByUser(req.user._id, status);

            res.render('purchase/index', {
                title: 'Purchase',
                active: status || 'all',
                orders
            });
        } catch (error) {
            console.error('Purchase page error:', error);
            res.status(500).render('error/500', {
                title: 'Error',
                message: error.message
            });
        }
    }

    // Get orders API
    async getOrders(req, res) {
        try {
            console.log('getOrders called, user:', req.user);
            const { status } = req.query;
            const orders = await orderService.getOrdersByUser(req.user._id, status);
            res.json({ success: true, orders });
        } catch (error) {
            console.error('Get orders error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Search orders API
    async searchOrders(req, res) {
        try {
            const { q } = req.query;
            const orders = await orderService.searchOrders(req.user._id, q);
            res.json({ success: true, orders });
        } catch (error) {
            console.error('Search orders error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Thêm các methods mới
    async getOrdersByStatus(req, res) {
        try {
            const { status } = req.query;
            const orders = await orderService.getOrdersByUser(req.user._id, status);
            res.json({ success: true, orders });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async searchOrders(req, res) {
        try {
            const { q } = req.query;
            const orders = await orderService.searchOrders(req.user._id, q);
            res.json({ success: true, orders });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const { orderId, status } = req.body;
            const updatedOrder = await orderService.updateOrderStatus(orderId, status);
            
            res.json({
                success: true,
                order: updatedOrder
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new OrderController();