// middleware/adminAuth.js
const isAdmin = (req, res, next) => {
  // First check if user is logged in (you might want to chain this with isLoggedIn)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  // Check if user has admin role
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required"
    });
  }

  next();
};

module.exports = isAdmin;