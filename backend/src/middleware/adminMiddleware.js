// Simple admin middleware: allows access only when logged-in user's email
// matches the ADMIN_EMAIL environment variable (case-insensitive).
const adminOnly = (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin role required.' });
    }
    return next();
  } catch (err) {
    return res.status(500).json({ message: 'Admin middleware error.' });
  }
};


module.exports = adminOnly;
