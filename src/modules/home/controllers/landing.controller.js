const productService = require('../modules/services/product.service');

class LandingController {
  async index(req, res) {
    try {
      const [newArrivals, topSelling, dressStyles] = await Promise.all([
        productService.getNewArrivals(),
        productService.getTopSelling(),
        productService.getDressStyles()
      ]);

      res.render('landing/index', {
        title: 'SixT Store - Your Fashion Destination',
        newArrivals,
        topSelling,
        dressStyles,
        metaDescription: 'Discover the latest fashion trends at SixT Store'
      });
    } catch (error) {
      console.error('Landing page error:', error);
      res.render('error', {
        title: 'Error - SixT Store',
        message: 'Something went wrong loading the homepage'
      });
    }
  }
}

module.exports = new LandingController();