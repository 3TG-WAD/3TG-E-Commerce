const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  product_name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category_id: {
    type: String,
    required: true,
    trim: true,
    ref: 'Category'
  },
  manufacturer_id: {
    type: String,
    required: true,
    trim: true,
  },
  creation_time: {
    type: Date,
    required: true,
  },
  specifications: mongoose.Schema.Types.Mixed,
  photos: [{ type: String }],
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
