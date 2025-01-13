const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
    trim: true,
    ref: 'Product',
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    // No need to ref to user model
    // required: true,
    // ref: 'User',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  photos: [{
    type: String
  }],
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
