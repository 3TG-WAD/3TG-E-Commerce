const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/auth.controller");

router.get(
  "/google",
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
