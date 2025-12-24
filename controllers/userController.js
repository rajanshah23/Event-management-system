const User = require("../models/userModel");
const RefreshToken = require("../models/refreshToken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");

//Generate Tokens
const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken  = crypto.randomBytes(64).toString("hex");

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return { accessToken, refreshToken, expiresAt };
};

const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",                    // ← Added (recommended)
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};


const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "Attendee",
    });

     //generatetoken
     const { accessToken, refreshToken,expiresAt } = await generateTokens(user);


    await RefreshToken.create({
  user: user._id,
  token: refreshToken,
  expiresAt,
});

setRefreshTokenCookie(res, refreshToken);
    res.status(201).json({
      message: "User registered successfully", 
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role:user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

       // Generate tokens
    const { accessToken, refreshToken, expiresAt } = await generateTokens(user);


       // Save new refresh token to DB
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt,
    });

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


  // Refresh token
const refreshToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Find the refresh token in the database
    const storedToken = await RefreshToken.findOne({ token: oldRefreshToken });
    if (!storedToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Check if the token has expired
    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ token: oldRefreshToken });
      return res.status(403).json({ message: 'Refresh token expired' });
    }

    // Get the user
    const user = await User.findById(storedToken.user);
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    const { accessToken, refreshToken: newRefreshToken, expiresAt: newExpiresAt } = await generateTokens(user);


     await RefreshToken.deleteOne({ token: oldRefreshToken });
    await RefreshToken.create({
      user: user._id,
      token: newRefreshToken,
      expiresAt: newExpiresAt,
    });
    
    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {res.status(500).json({ message: err.message });
  }}

  // Logout
const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // Delete the refresh token from the database
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    // Clear the cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { registerUser, loginUser,refreshToken , logoutUser, };