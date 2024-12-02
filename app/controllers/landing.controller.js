const config = require('../../config/config');

exports.index = (req, res) => {
  try {
    res.render('landing/index', {
      title: '3TG Store - Your Fashion Destination',
      env: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Landing page error:', error);
    res.status(500).render('error/500', {
      title: '500 - Server Error'
    });
  }
};