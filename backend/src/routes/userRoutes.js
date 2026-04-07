const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  registerUser, loginUser, getProfile,
  getAllUsers, getUsersPaginated, exportUsersCSV,
  updateProfile, deleteUser, updateUserById,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { requireRole, requireMinRole } = require("../middleware/roleMiddleware");

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];
const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);
router.get("/login", (_, res) => res.status(405).json({ message: "Use POST /api/users/login" }));
router.get("/register", (_, res) => res.status(405).json({ message: "Use POST /api/users/register" }));

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteUser);

router.get("/all", protect, requireRole("admin"), getAllUsers);
router.put("/:id", protect, requireMinRole("moderator"), updateUserById);
router.delete("/:id", protect, requireRole("admin"), deleteUser);

router.get("/", protect, requireMinRole("viewer"), getUsersPaginated);

// NEW: Export filtered users as CSV (admin only, no pagination)
router.get("/export", protect, requireRole("admin"), exportUsersCSV);

module.exports = router;
