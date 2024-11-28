const dotenv = require('dotenv');
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://mongodb:27017/ecommerce',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
};

module.exports = config;