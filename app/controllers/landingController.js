const config = require('../../config/config');

exports.index = (req, res) => {
  try {
    res.render('landing/index', {
      title: 'Welcome to E-commerce',
      env: config.env,
      sections: {
        hero: {
          title: 'Your Shopping Destination',
          subtitle: 'Find everything you need'
        },
        features: [
          // Feature data
        ],
        about: {
          // About section data
        }
      }
    });
  } catch (error) {
    console.error('Landing page error:', error);
    res.status(500).render('error/500');
  }
};
