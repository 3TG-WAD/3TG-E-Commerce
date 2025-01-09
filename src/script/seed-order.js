const mongoose = require("mongoose");
const Order = require("../modules/order/models/order");
const config = require("../config/config");

// Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/ecommerce", {

});

// Dữ liệu mẫu
const sampleOrders = [
  {
    order_id: "OD001",
    user_id: "677f646e4046cae2e98c9e80", // Thay bằng user_id thực tế
    shop_id: "SP001",
    items: [
      {
        product_id: "P001",
        variant_id: "V001",
        product_name: "Áo thun nam cổ tròn",
        product_image:
          "https://down-vn.img.susercontent.com/file/sg-11134201-7qvdr-lf8f4h0n77o153",
        variant: "Màu trắng - Size M",
        quantity: 2,
        price: 150000,
        discount: 20000,
      },
    ],
    status: "pending",
    total_amount: 260000,
    shipping_address: "123 Đường ABC, Quận 1, TP.HCM",
    payment_method: "COD",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    order_id: "OD002",
    user_id: "677f646e4046cae2e98c9e80", // Thay bằng user_id thực tế
    shop_id: "SP002",
    items: [
      {
        product_id: "P002",
        variant_id: "V002",
        product_name: "Quần jean nam ống suông",
        product_image:
          "https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lf8q5rpvp6o9f5",
        variant: "Màu xanh đậm - Size 32",
        quantity: 1,
        price: 450000,
        discount: 50000,
      },
    ],
    status: "processing",
    total_amount: 400000,
    shipping_address: "456 Đường XYZ, Quận 2, TP.HCM",
    payment_method: "Banking",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    order_id: "OD003",
    user_id: "677f646e4046cae2e98c9e80", // Thay bằng user_id thực tế
    shop_id: "SP003",
    items: [
      {
        product_id: "P003",
        variant_id: "V003",
        product_name: "Giày thể thao nam",
        product_image:
          "https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lf8q5rpvykqe43",
        variant: "Màu đen - Size 42",
        quantity: 1,
        price: 850000,
        discount: 150000,
      },
    ],
    status: "completed",
    total_amount: 700000,
    shipping_address: "789 Đường DEF, Quận 3, TP.HCM",
    payment_method: "Banking",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 ngày trước
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 ngày trước
  },
  {
    order_id: "OD004",
    user_id: "677f646e4046cae2e98c9e80", // Thay bằng user_id thực tế
    shop_id: "SP001",
    items: [
      {
        product_id: "P004",
        variant_id: "V004",
        product_name: "Áo khoác dù nam",
        product_image:
          "https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lf8q5rpw1c7s6f",
        variant: "Màu đen - Size L",
        quantity: 1,
        price: 320000,
        discount: 20000,
      },
      {
        product_id: "P005",
        variant_id: "V005",
        product_name: "Áo thun nam cổ trụ",
        product_image:
          "https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lf8q5rpw4kh501",
        variant: "Màu xám - Size L",
        quantity: 2,
        price: 180000,
        discount: 30000,
      },
    ],
    status: "cancelled",
    total_amount: 630000,
    shipping_address: "321 Đường GHI, Quận 4, TP.HCM",
    payment_method: "COD",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 ngày trước
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 ngày trước
  },
  {
    order_id: "OD005",
    user_id: "677f646e4046cae2e98c9e80", // Thay bằng user_id thực tế
    shop_id: "SP002",
    items: [
      {
        product_id: "P006",
        variant_id: "V006",
        product_name: "Quần short nam",
        product_image:
          "https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lf8q5rpw7p5u01",
        variant: "Màu be - Size M",
        quantity: 2,
        price: 220000,
        discount: 40000,
      },
    ],
    status: "shipping",
    total_amount: 400000,
    shipping_address: "654 Đường JKL, Quận 5, TP.HCM",
    payment_method: "Banking",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 ngày trước
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 ngày trước
  },
];

// Hàm insert dữ liệu
async function seedOrders() {
  try {
    // Xóa tất cả orders cũ
    await Order.deleteMany({});

    // Insert dữ liệu mẫu
    const result = await Order.insertMany(sampleOrders);

    console.log(`Đã thêm thành công ${result.length} đơn hàng mẫu`);

    // Đóng kết nối
    mongoose.connection.close();
  } catch (error) {
    console.error("Lỗi khi thêm dữ liệu mẫu:", error);
    mongoose.connection.close();
  }
}

// Chạy script
seedOrders();
