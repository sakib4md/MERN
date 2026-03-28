const User = require("../models/UserModel");
const { generateToken } = require("../utils/jwtUtils");

/**
 * @route  POST /api/users/register
 * @access Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Create user (password is hashed in model pre-save hook)
    const user = await User.create({ name, email, password });

    // Generate JWT
    const token = generateToken({ id: user._id, email: user.email });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err); // passes to global error handler
  }
};

/**
 * @route  POST /api/users/login
 * @access Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password (select: false by default in model)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate JWT
    const token = generateToken({ id: user._id, email: user.email });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route  GET /api/users/profile
 * @access Private (requires JWT)
 */
const getProfile = async (req, res, next) => {
  try {
    // req.user is attached by the protect middleware
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route  GET /api/users/all
 * @access Private (requires JWT)
 * Returns a list of all users with basic info
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, "name email createdAt").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerUser, loginUser, getProfile, getAllUsers };

/**
 * @route  GET /api/users
 * @access Private
 * @description Get paginated users list with optional search. Query params: ?page=1&limit=10&search=john
 */
const getUsersPaginated = async (req, res, next) => {
  try {
    // ✅ sanitize inputs
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // max 50
    const search = (req.query.search || "").toString().trim();

    const skip = (page - 1) * limit;

    // ✅ build query
    const match = {};
    if (search) {
      match.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // ✅ fetch data
    const users = await User.find(match, "name email createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // ✅ count total
    const total = await User.countDocuments(match);
    const totalPages = Math.ceil(total / limit);

    // ✅ response
    res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route  PUT /api/users/profile
 * @access Private
 * @description Update the logged-in user's profile (name, email, password)
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found." });

    const { name, email, password } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // pre-save hook will hash

    await user.save();// updating db

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route  DELETE /api/users/profile  (or DELETE /api/users/:id)
 * @access Private
 * @description Delete a user. If `:id` provided delete that user, otherwise delete logged-in user.
 */
const deleteUser = async (req, res, next) => {
  try {
    const targetId = req.params.id || req.user._id;
    const deleted = await User.findByIdAndDelete(targetId);
    if (!deleted) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ success: true, message: "User deleted." });
  } catch (err) {
    next(err);
  }
};

/**
 * @route  PUT /api/users/:id
 * @access Private
 * @description Update a user by id (admin-style). Updates name/email/password
 */
const updateUserById = async (req, res, next) => {
  console.log("updateUserById called with id:", req.params.id, "and body:", req.body);
  try {
    const targetId = req.params.id;
    const user = await User.findById(targetId).select("+password");
    if (!user) return res.status(404).json({ message: "User not found." });

    const { name, email, password } = req.body;
    console.log("Updating user with:", { name, email, password });
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerUser, loginUser, getProfile, getAllUsers, getUsersPaginated, updateProfile, deleteUser, updateUserById };
