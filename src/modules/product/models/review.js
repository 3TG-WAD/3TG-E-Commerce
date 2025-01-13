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
    ref: 'User',
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
  photos: [{
    type: String,
  }],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
