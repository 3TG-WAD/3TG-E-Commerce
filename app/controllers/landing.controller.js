const productService = require('../services/product.service');

class LandingController {
  async index(req, res) {
    try {
      const [newArrivals, topSelling, dressStyles] = await Promise.all([
        productService.getNewArrivals(),
        productService.getTopSelling(),
        productService.getDressStyles()
      ]);

      res.render('landing/index', {
        title: '3TG Store - Your Fashion Destination',
        newArrivals,
        topSelling,
        dressStyles,
        metaDescription: 'Discover the latest fashion trends at 3TG Store'
      });
    } catch (error) {
      console.error('Landing page error:', error);
      res.render('error', {
        title: 'Error - 3TG Store',
        message: 'Something went wrong loading the homepage'
      });
    }
  }
}

module.exports = new LandingController();