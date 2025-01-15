const orderService = require('../services/order.service');
const getStatusText = (status) => {
  const statusMap = {
      'pending': 'Pending',
      'processing': 'Processing',
      'shipping': 'Shipping',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
  };
  return statusMap[status] || status;
};

const getStatusStyle = (status) => {
  const styleMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipping': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
  };
  return styleMap[status] || 'bg-gray-100 text-gray-800';
};
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

    async getOrderDetails(req, res) {
        try {
            const orderId = req.params.orderId;
            const order = await orderService.getOrderById(orderId);
            
            if (!order) {
                return res.status(404).render('error', {
                    title: 'Error - Order Not Found',
                    message: 'Order not found'
                });
            }

            res.render('purchase/order-details', {
                title: `Order #${orderId}`,
                order,
                getStatusStyle,
                getStatusText,
                formatCurrency: (amount) => {
                    return new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(amount);
                }
            });
        } catch (error) {
            console.error('Error getting order details:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading order details'
            });
        }
    }
}

module.exports = new OrderController();