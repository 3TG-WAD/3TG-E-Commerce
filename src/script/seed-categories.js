const Category = require('../modules/product/models/category');

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

async function seedCategories(connection) {
    try {
        await Category.deleteMany({});
        const result = await Category.insertMany(categories);
        console.log('Categories inserted successfully:', result);
    } catch (error) {
        throw error;
    }
}

module.exports = seedCategories;