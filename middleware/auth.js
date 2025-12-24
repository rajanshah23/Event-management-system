const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "mysecret"
    );

    // Find user in DB
    const user = await User.findById(decoded.id).select(
      "username email role"
    );

    if (!user) {
      return res.status(403).json({ message: "Invalid token - user not found" });
    }

    // Attach user to req
    req.user = user;

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = isLoggedIn;