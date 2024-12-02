const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  variant_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  product_id: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
  },
  material: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  is_available: {
    type: Boolean,
    required: true,
  },
  in_stock: {
    type: Number,
    required: true,
  },
});

const Variant = mongoose.model("Variant", variantSchema);
module.exports = Variant;