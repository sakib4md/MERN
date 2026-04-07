const User = require("../models/UserModel");
const { generateToken } = require("../utils/jwtUtils");

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered." });
    const user = await User.create({ name, email, password });
    const token = generateToken({ id: user._id, email: user.email });
    res.status(201).json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    });
  } catch (err) { next(err); }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid email or password." });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password." });
    const token = generateToken({ id: user._id, email: user.email });
    res.status(200).json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
};

const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id, name: req.user.name,
        email: req.user.email, role: req.user.role,
        createdAt: req.user.createdAt,
      },
    });
  } catch (err) { next(err); }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, "name email createdAt role").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (err) { next(err); }
};

const getUsersPaginated = async (req, res, next) => {
  try {
    const page    = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit   = Math.min(parseInt(req.query.limit) || 10, 50);
    const search  = (req.query.search || "").toString().trim();
    const sortStr = (req.query.sort   || "createdAt").toString().trim();
    const skip    = (page - 1) * limit;
    const match   = {};
    if (search) match.$or = [
      { name:  { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
    const allowedFields = ["name", "email", "createdAt"];
    const sortObj = {};
    sortStr.split(",").forEach(f => {
      const field = f.replace(/^-/, "");
      if (allowedFields.includes(field)) sortObj[field] = f.startsWith("-") ? -1 : 1;
    });
    if (!Object.keys(sortObj).length) sortObj.name = 1;
    const users      = await User.find(match, "name email role createdAt status").sort(sortObj).skip(skip).limit(limit);
    const total      = await User.countDocuments(match);
    const totalPages = Math.ceil(total / limit);
    res.status(200).json({
      success: true, users,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    });
  } catch (err) { next(err); }
};

// NEW: Export ALL filtered users as CSV (no pagination, admin only)
const exportUsersCSV = async (req, res, next) => {
  try {
    const search = (req.query.search || "").toString().trim();
    const role = req.query.role?.toString().trim();
    const sortStr = (req.query.sort || "name").toString().trim();
    
    // Same query logic as paginated, but NO pagination
    const match = {};
    if (search) {
      match.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role && ['viewer','editor','moderator','cs','admin'].includes(role)) {
      match.role = role;
    }
    
    const allowedFields = ["name", "email", "createdAt"];
    const sortObj = {};
    sortStr.split(",").forEach(f => {
      const field = f.replace(/^-/, "");
      if (allowedFields.includes(field)) {
        sortObj[field] = f.startsWith("-") ? -1 : 1;
      }
    });
    if (!Object.keys(sortObj).length) sortObj.name = 1;
    
    // Max 50k rows for performance
    const maxRows = 50000;
    const total = await User.countDocuments(match);
    if (total > maxRows) {
      return res.status(400).json({ 
        message: `Too many users (${total.toLocaleString()}). Max ${maxRows.toLocaleString()}. Use more specific filters.` 
      });
    }
    
    const users = await User.find(match, "name email role createdAt status")
      .sort(sortObj)
      .lean(); // lean for performance
    
    // Build CSV
    const headers = ["Name", "Email", "Role", "Status", "Created At"];
    let csv = headers.join(",") + "\n";
    
    users.forEach(user => {
      const row = [
        `"${(user.name || '').replace(/"/g, '""')}"`,
        `"${(user.email || '').replace(/"/g, '""')}"`,
        `"${(user.role || '').replace(/"/g, '""')}"`,
        `"${(user.status || 'active').replace(/"/g, '""')}"`,
        `"${new Date(user.createdAt).toLocaleString().replace(/"/g, '""')}"`
      ];
      csv += row.join(",") + "\n";
    });
    
    // CSV response headers
    res.set({
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="users.csv"',
      "Content-Length": Buffer.byteLength(csv, "utf8")
    });
    
    res.status(200).send(csv);
    
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/profile
 * Allows user to update name, email, password.
 * Role is ALSO accepted here intentionally — this app uses a role-switcher
 * for demo/testing. The valid enum values are enforced by the Mongoose model.
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found." });
    const { name, email, password, role } = req.body;
    if (name)     user.name     = name;
    if (email)    user.email    = email;
    if (password) user.password = password;
    // role: accepted so the Settings role-picker works
    if (role)     user.role     = role;
    await user.save();
    res.status(200).json({
      success: true,
      user: {
        id: user._id, name: user.name,
        email: user.email, role: user.role,   // ← role included in response
        createdAt: user.createdAt,
      },
    });
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    const targetId = req.params.id || req.user._id;
    const deleted  = await User.findByIdAndDelete(targetId);
    if (!deleted) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ success: true, message: "User deleted." });
  } catch (err) { next(err); }
};

const updateUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found." });
    const { name, email, password, role } = req.body;
    if (name)     user.name     = name;
    if (email)    user.email    = email;
    if (password) user.password = password;
    if (role)     user.role     = role;
    await user.save();
    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
};

module.exports = {
  registerUser, loginUser, getProfile, getAllUsers,
  getUsersPaginated, exportUsersCSV, updateProfile, deleteUser, updateUserById,
};
