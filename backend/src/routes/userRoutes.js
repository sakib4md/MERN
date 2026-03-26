const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const { registerUser, loginUser, getProfile, getAllUsers, updateProfile, deleteUser, updateUserById } = require("../controllers/userController");
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
// Friendly responses for GET requests to POST-only endpoints
router.get("/login", (req, res) => res.status(405).json({ success: false, message: "Use POST /api/users/login with JSON body { email, password }" }));
router.get("/register", (req, res) => res.status(405).json({ success: false, message: "Use POST /api/users/register with JSON body { name, email, password }" }));

// ===== PROTECTED ROUTES (JWT required) =====
router.get("/profile", protect, getProfile);
// Update logged-in user's profile
router.put("/profile", protect, updateProfile);
// Delete logged-in user's profile
router.delete("/profile", protect, deleteUser);

// Admin/update/delete by id (protected)
router.put("/:id", protect, updateUserById);
router.delete("/:id", protect, deleteUser);

// ===== ADMIN / LISTING =====
// Returns list of all users (protected)
router.get("/all", protect, getAllUsers);




module.exports = router;
