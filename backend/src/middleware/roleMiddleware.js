const User = require('../models/UserModel');

/**
 * Role middleware - checks if user has required role
 * Usage: router.get('/admin', protect, requireRole('admin'), adminHandler)
 */
const requireRole = (role) => {
  return async (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: `Requires ${role} role` });
    }
    next();
  };
};

/**
 * Higher role check - admin > cs > moderator > editor > viewer (0 = highest)
 */
const rolePriority = {
  admin: 0,
  cs: 1,
  moderator: 2,
  editor: 3,
  viewer: 4
};

const requireMinRole = (minRole) => {
  return async (req, res, next) => {
    const userPriority = rolePriority[req.user.role];
    const minPriority = rolePriority[minRole];
    if (userPriority > minPriority) {
      return res.status(403).json({ message: `Requires ${minRole} role or higher` });
    }
    next();
  };
};

module.exports = { requireRole, requireMinRole };

