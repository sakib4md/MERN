const ROLE_PRIORITY = { admin: 0, cs: 1, moderator: 2, editor: 3, viewer: 4 };

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Requires one of: ${roles.join(', ')}` });
  }
  next();
};

const requireMinRole = (minRole) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });
  const userPriority = ROLE_PRIORITY[req.user.role] ?? 99;
  const minPriority  = ROLE_PRIORITY[minRole]       ?? 99;
  if (userPriority > minPriority) {
    return res.status(403).json({ message: `Requires ${minRole} role or higher.` });
  }
  next();
};

module.exports = { requireRole, requireMinRole };
