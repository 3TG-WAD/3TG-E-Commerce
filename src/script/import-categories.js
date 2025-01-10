const Category = require('../modules/product/models/category');
const mongoose = require('mongoose');

const categories = [
  {
    category_id: "CLOTHING",
    category_name: "Clothing",
    slug: "clothing"
  },
  {
    category_id: "LIFESTYLE_SHOES",
    category_name: "Lifestyle Shoes",
    slug: "lifestyle-shoes"
  },
  {
    category_id: "RUNNING_SHOES",
    category_name: "Running Shoes", 
    slug: "running-shoes"
  }
];

async function insertCategories() {
  try {
    // Thêm connection string MongoDB hợp lệ
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    // Xóa categories cũ nếu cần
    await Category.deleteMany({});
    
    // Insert categories mới
    const result = await Category.insertMany(categories);
    console.log('Categories inserted successfully:', result);
    
  } catch (error) {
    console.error('Error inserting categories:', error);
  } finally {
    mongoose.disconnect();
  }
}

insertCategories();