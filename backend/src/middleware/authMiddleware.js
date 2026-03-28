const { verifyToken } = require("../utils/jwtUtils");
const User = require("../models/UserModel");

/**
 * Protect middleware - verifies JWT and attaches user to req
 * Usage: router.get("/profile", protect, getProfile)
 */
const protect = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized. No token.-sakibtest" });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const decoded = verifyToken(token);

    // 3. Find user from decoded token (exclude password)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized. Invalid token." });
  }
};

module.exports = { protect };
