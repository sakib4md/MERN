const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const { registerUser, loginUser, getProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Validation rules
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// ===== PUBLIC ROUTES =====
router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);

// ===== PROTECTED ROUTES (JWT required) =====
router.get("/profile", protect, getProfile);

module.exports = router;
