const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  category_id: {
    type: String,
    required: true,
    unique: true
  },
  category_name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Tự động tạo slug từ category_name trước khi lưu
categorySchema.pre('save', function(next) {
  if (this.category_name) {
    this.slug = this.category_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;