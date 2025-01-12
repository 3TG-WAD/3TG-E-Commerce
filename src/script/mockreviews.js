const mongoose = require("mongoose");

const reviews = [
  // NK-AM-270-001
  {
    product_id: "NK-AM-270-001",
    user_id: new mongoose.Types.ObjectId(), //  ObjectId
    rating: 5,
    comment: "Great shoes, very comfortable and stylish!",
  },
    {
    product_id: "NK-AM-270-001",
    user_id: new mongoose.Types.ObjectId(), //  ObjectId
    rating: 4,
    comment: "Very good. I like it.",
  },
  {
    product_id: "NK-AM-270-001",
    user_id: new mongoose.Types.ObjectId(), //  ObjectId
    rating: 4,
    comment: "Very good. I like it.",
  },
  {
    product_id: "NK-AM-270-001",
    user_id: new mongoose.Types.ObjectId(), //  ObjectId
    rating: 4,
    comment: "Very good. I like it.",
  },
  {
    product_id: "NK-AM-270-001",
    user_id: new mongoose.Types.ObjectId(), //  ObjectId
    rating: 4,
    comment: "Very good. I like it.",
  },
  {
    product_id: "NK-AM-270-001",
    user_id: new mongoose.Types.ObjectId(), //  ObjectId
    rating: 4,
    comment: "Very good. I like it.",
  },
  {
    product_id: "NK-AM-270-001",
    user_id: new mongoose.Types.ObjectId(), //  ObjectId
    rating: 4,
    comment: "Very good. I like it.",
  },
  {
    product_id: "NK-AM-270-001",
    user_id: new mongoose.Types.ObjectId(), //  ObjectId
    rating: 4,
    comment: "Very good. I like it.",
  },
  {
    product_id: "NK-AM-270-001",
    user_id: new mongoose.Types.ObjectId(), //  ObjectId
    rating: 4,
    comment: "Very good. I like it.",
  },
  {
    product_id: "NK-AM-270-001",
    user_id: new mongoose.Types.ObjectId(), //  ObjectId
    rating: 4,
    comment: "Very good. I like it.",
  },
  // AD-ULTRABOOST-002
  {
    product_id: "AD-ULTRABOOST-002",
    user_id: new mongoose.Types.ObjectId(),
    rating: 4,
    comment: "Amazing cushioning, perfect for running.",
  },
  {
    product_id: "AD-ULTRABOOST-002",
    user_id: new mongoose.Types.ObjectId(),
    rating: 5,
    comment: "Best running shoes I've ever owned.",
  },
  {
    product_id: "AD-ULTRABOOST-002",
     user_id: new mongoose.Types.ObjectId(),
    rating: 4,
    comment: "Good quality but price is a bit high",
  },
  // PUMA-RS-X-003
  {
    product_id: "PUMA-RS-X-003",
    user_id: new mongoose.Types.ObjectId(),
    rating: 3,
    comment: "Decent shoes, but not as comfortable as I expected.",
  },
  {
    product_id: "PUMA-RS-X-003",
    user_id: new mongoose.Types.ObjectId(),
    rating: 4,
    comment: "I like the design, pretty good overall.",
  },
  // NB-990V5-004
  {
    product_id: "NB-990V5-004",
    user_id: new mongoose.Types.ObjectId(),
    rating: 5,
    comment: "Classic and comfortable, worth the investment.",
  },
   {
    product_id: "NB-990V5-004",
    user_id: new mongoose.Types.ObjectId(),
    rating: 5,
    comment: "Good shoes and fast delivery",
  },
  // ASICS-GEL-KAYANO-005
  {
    product_id: "ASICS-GEL-KAYANO-005",
    user_id: new mongoose.Types.ObjectId(),
    rating: 4,
    comment: "Great for overpronation support.",
  },
    {
    product_id: "ASICS-GEL-KAYANO-005",
    user_id: new mongoose.Types.ObjectId(),
    rating: 3,
    comment: "A bit narrow for my feet.",
  },
  // NIKE-T-SHIRT-006
  {
    product_id: "NIKE-T-SHIRT-006",
    user_id: new mongoose.Types.ObjectId(),
    rating: 4,
    comment: "Good quality material, fits well.",
  },
    {
    product_id: "NIKE-T-SHIRT-006",
    user_id: new mongoose.Types.ObjectId(),
    rating: 5,
    comment: "My best T-shirt",
  },
  // ADIDAS-SHORTS-007
  {
    product_id: "ADIDAS-SHORTS-007",
    user_id: new mongoose.Types.ObjectId(),
    rating: 3,
    comment: "Not as breathable as I expected.",
  },
  {
    product_id: "ADIDAS-SHORTS-007",
    user_id: new mongoose.Types.ObjectId(),
    rating: 4,
     comment: "I use it everyday, pretty good",
  },
  // PUMA-JACKET-008
  {
    product_id: "PUMA-JACKET-008",
    user_id: new mongoose.Types.ObjectId(),
    rating: 5,
    comment: "Keeps me warm, great for outdoor activities.",
  },
  // NB-HOODIE-009
  {
    product_id: "NB-HOODIE-009",
     user_id: new mongoose.Types.ObjectId(),
    rating: 4,
    comment: "Comfortable and stylish hoodie.",
  },
  {
    product_id: "NB-HOODIE-009",
     user_id: new mongoose.Types.ObjectId(),
    rating: 3,
    comment: "Not really as durable as I expected",
  },
  // ASICS-TIGHTS-010
  {
    product_id: "ASICS-TIGHTS-010",
     user_id: new mongoose.Types.ObjectId(),
    rating: 5,
    comment: "Perfect fit, great for workouts.",
  },
  // NIKE-FLEECE-011
  {
    product_id: "NIKE-FLEECE-011",
    user_id: new mongoose.Types.ObjectId(),
    rating: 4,
    comment: "Warm and comfy, good for layering.",
  },
   {
    product_id: "NIKE-FLEECE-011",
     user_id: new mongoose.Types.ObjectId(),
    rating: 4,
    comment: "Nice. I like it.",
  },
  // ADIDAS-TANK-012
  {
    product_id: "ADIDAS-TANK-012",
     user_id: new mongoose.Types.ObjectId(),
    rating: 3,
    comment: "Basic tank top, nothing too special.",
  },
   {
    product_id: "ADIDAS-TANK-012",
     user_id: new mongoose.Types.ObjectId(),
    rating: 2,
    comment: "Too small for me",
  },
  // PUMA-SHOES-013
  {
    product_id: "PUMA-SHOES-013",
    user_id: new mongoose.Types.ObjectId(),
    rating: 4,
    comment: "Good for casual wear.",
  },
  {
    product_id: "PUMA-SHOES-013",
     user_id: new mongoose.Types.ObjectId(),
    rating: 4,
    comment: "Comfortable and good price",
  },
  // NB-TANK-014
  {
    product_id: "NB-TANK-014",
     user_id: new mongoose.Types.ObjectId(),
    rating: 5,
    comment: "Lightweight and breathable.",
  },
  // ASICS-SHOES-015
  {
    product_id: "ASICS-SHOES-015",
     user_id: new mongoose.Types.ObjectId(),
    rating: 4,
    comment: "Good running shoes, supportive.",
  },
  {
    product_id: "ASICS-SHOES-015",
     user_id: new mongoose.Types.ObjectId(),
    rating: 5,
    comment: "I like it so much",
  },
  // NIKE-LEGGINGS-016
  {
    product_id: "NIKE-LEGGINGS-016",
     user_id: new mongoose.Types.ObjectId(),
    rating: 3,
    comment: "Fit well but can get hot.",
  },
  // ADIDAS-JACKET-017
  {
    product_id: "ADIDAS-JACKET-017",
    user_id: new mongoose.Types.ObjectId(),
    rating: 5,
    comment: "Stylish and functional jacket.",
  },
  {
    product_id: "ADIDAS-JACKET-017",
    user_id: new mongoose.Types.ObjectId(),
    rating: 4,
    comment: "Good quality, worth the price",
  },
  // PUMA-T-SHIRT-018
  {
    product_id: "PUMA-T-SHIRT-018",
     user_id: new mongoose.Types.ObjectId(),
    rating: 4,
    comment: "Comfortable and good quality.",
  },
    {
    product_id: "PUMA-T-SHIRT-018",
    user_id: new mongoose.Types.ObjectId(),
    rating: 4,
    comment: "good shirt",
  },
  // NB-SHORTS-019
  {
    product_id: "NB-SHORTS-019",
     user_id: new mongoose.Types.ObjectId(),
    rating: 5,
    comment: "Great fit and perfect for sports.",
  },
  // ASICS-SWEATSHIRT-020
  {
    product_id: "ASICS-SWEATSHIRT-020",
     user_id: new mongoose.Types.ObjectId(),
    rating: 4,
    comment: "Comfortable and warm sweatshirt.",
  },
  {
    product_id: "ASICS-SWEATSHIRT-020",
     user_id: new mongoose.Types.ObjectId(),
    rating: 4,
    comment: "I like its design",
  },
];

module.exports = reviews;