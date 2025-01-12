require("dotenv").config();
const mongoose = require("mongoose");
const Review = require("../modules/product/models/review");
const reviewsData = require("./mockreviews.js");

const MONGODB_URI = 'mongodb://localhost:27017/ecommerce';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

const insertReviews = async () => {
  try {
    await connectDB();
    // Insert data
    await Review.insertMany(reviewsData);
    console.log("Reviews inserted successfully!");
  } catch (error) {
    console.error("Error inserting reviews:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed");
  }
};

insertReviews();