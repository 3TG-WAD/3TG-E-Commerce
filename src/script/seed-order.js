const mongoose = require('mongoose');
const Order = require('../modules/order/models/order');

// Kết nối database với xử lý lỗi
mongoose.connect("mongodb://localhost:27017/ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB successfully");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
});

const USER_ID = "677f646e4046cae2e98c9e80";

// Dữ liệu mẫu
const sampleOrders = [
    {
        order_id: "OD001",
        user_id: new mongoose.Types.ObjectId(USER_ID),
        shop_id: "SP001",
        items: [
            {
                product_id: "NK-AM-270-001",
                variant_id: "NK-001-BLK",
                product_name: "Nike Air Max 270",
                product_image: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/gorfwjchoasrrzr1fggt/AIR+MAX+270.png",
                color: "Black/Anthracite",
                size: "US 8",
                quantity: 1,
                price: 159.99 * 23000,
                discount: 15 * 23000
            }
        ],
        shipping_address: "123 Nguyễn Du, Q.1, TP.HCM",
        payment_method: "COD",
        status: "completed",
        total_amount: (159.99 * 23000) - (15 * 23000),
        created_at: "2024-03-15T08:00:00Z"
    },
    {
        order_id: "OD002",
        user_id: new mongoose.Types.ObjectId(USER_ID), 
        shop_id: "SP002",
        items: [
            {
                product_id: "AD-ULTRABOOST-002",
                variant_id: "AD-003-BLU",
                product_name: "Adidas Ultraboost",
                product_image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/53a3ca19c06b4c5abc39131398fae837_9366/Giay_Ultraboost_5x_DJen_JI1334_HM3_hover.jpg",
                color: "Navy Blue",
                size: "US 9",
                quantity: 1,
                price: 179.99 * 23000,
                discount: 12 * 23000
            },
            {
                product_id: "ADIDAS-SHORTS-007",
                variant_id: "AD-014-SLV",
                product_name: "Adidas Performance Shorts",
                product_image: "https://assets.adidas.com/images/w_766,h_766,f_auto,q_auto,fl_lossy,c_fill,g_auto/2a24b1757281413f879146126ea55968_9366/gym-training-2-in-1-shorts.jpg",
                color: "Silver Grey",
                size: "L",
                quantity: 2,
                price: 189.50 * 23000,
                discount: 25 * 23000
            }
        ],
        shipping_address: "456 Lê Lợi, Q.3, TP.HCM",
        payment_method: "Credit Card",
        status: "shipping",
        total_amount: ((179.99 + (189.50 * 2)) * 23000) - ((12 + (25 * 2)) * 23000),
        created_at: "2024-03-16T10:30:00Z"
    },
    {
        order_id: "OD003",
        user_id: new mongoose.Types.ObjectId(USER_ID),
        shop_id: "SP003",
        items: [
            {
                product_id: "PUMA-RS-X-003",
                variant_id: "PU-004-GRN",
                product_name: "Puma RS-X",
                product_image: "https://authentic-shoes.com/wp-content/uploads/2023/04/369818_08.png_c0d906b4dd0c4ab6a4ca8e3c59fa0256.png",
                color: "Vibrant Green",
                size: "US 8.5",
                quantity: 1,
                price: 139.99 * 23000,
                discount: 18 * 23000
            }
        ],
        shipping_address: "789 Võ Văn Tần, Q.3, TP.HCM",
        payment_method: "Momo",
        status: "pending",
        total_amount: (139.99 * 23000) - (18 * 23000),
        created_at: "2024-03-17T14:15:00Z"
    }
];

// Hàm seed data
const seedOrders = async () => {
    try {
        // Xóa dữ liệu cũ
        await Order.deleteMany({});
        
        // Thêm dữ liệu mới
        const result = await Order.insertMany(sampleOrders);
        
        console.log(`Đã thêm thành công ${result.length} đơn hàng mẫu`);
        
        // Đóng kết nối
        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding orders:", error);
        mongoose.connection.close();
        process.exit(1);
    }
};

// Chạy seed
seedOrders();