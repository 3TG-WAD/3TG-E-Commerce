const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/auth.controller");

// Middleware để lưu cart trước khi bắt đầu OAuth
const saveCartMiddleware = (req, res, next) => {
    const sessionId = req.session.id;
    const cartItems = req.session.cartItems || [];
    
    // Lưu vào global storage với key cố định
    global.tempGoogleCart = cartItems;  // Không dùng Map nữa
    
    console.log('Cart saved to global storage:', global.tempGoogleCart);
    next();
};

router.get(
    "/google",
    saveCartMiddleware,  // Thêm middleware này trước passport.authenticate
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

router.get(
    "/authenticate",
    passport.authenticate("google", { failureRedirect: "/auth/login" }),
    authController.googleCallback
);

module.exports = router;