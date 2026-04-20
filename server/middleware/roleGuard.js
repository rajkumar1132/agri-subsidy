// ============================================================
// Role-Based Access Control Middleware
// ============================================================

/**
 * Returns middleware that restricts access to specified roles.
 * @param  {...string} allowedRoles — e.g. 'ADMIN', 'FARMER', 'PROGRAM_OFFICER'
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.userType}`,
      });
    }
    next();
  };
}

module.exports = { requireRole };
