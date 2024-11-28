const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.db.uri, config.db.options);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    
    // Xử lý các events của MongoDB
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;