const productService = require('../../product/services/product.service');

exports.getHomePage = async (req, res) => {
    try {
        // Lấy dữ liệu từ service
        const [newArrivals, topSelling, dressStyles] = await Promise.all([
            productService.getNewArrivals(),
            productService.getTopSelling(),
            productService.getDressStyles()
        ]);

        res.render('landing/index', {
            title: 'SixT Store - Your Fashion Destination',
            user: req.user || null,
            newArrivals,     // Truyền dữ liệu vào view
            topSelling,      // Truyền dữ liệu vào view
            dressStyles      // Truyền dữ liệu vào view
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.status(500).render('error/500', {
            title: 'Error',
            message: error.message
        });
    }
}; 