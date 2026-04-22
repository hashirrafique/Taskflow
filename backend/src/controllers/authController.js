const { validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const { signToken } = require('../utils/token');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// POST /api/auth/register
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const { name, email, password } = req.body;

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const palette = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444'];
  const avatarColor = palette[Math.floor(Math.random() * palette.length)];

  const user = await User.create({ name, email, password, avatarColor });
  const token = signToken(user._id);

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, avatarColor: user.avatarColor, profilePic: user.profilePic },
  });
};

// POST /api/auth/login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signToken(user._id);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, avatarColor: user.avatarColor, profilePic: user.profilePic },
  });
};

// GET /api/auth/me
const me = async (req, res) => {
  res.json({ user: req.user });
};

// POST /api/auth/profile-pic
const uploadProfilePic = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filename = `user-${req.user._id}-${Date.now()}.webp`;
  const uploadDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filepath = path.join(uploadDir, filename);

  try {
    await sharp(req.file.buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(filepath);

    const profilePicUrl = `/public/uploads/${filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: profilePicUrl },
      { new: true }
    );

    res.json({ profilePic: profilePicUrl, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error processing image', error: error.message });
  }
};

// PATCH /api/auth/profile
const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { name, username, bio, website, location, avatarColor } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (username !== undefined) updates.username = username;
  if (bio !== undefined) updates.bio = bio;
  if (website !== undefined) updates.website = website;
  if (location !== undefined) updates.location = location;
  if (avatarColor !== undefined) updates.avatarColor = avatarColor;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ user });
};

// PATCH /api/auth/change-password
const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.matchPassword(currentPassword))) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  const user = await User.findOne({ email: email.toLowerCase() });
  // Always return success to avoid user enumeration
  if (!user) {
    return res.json({ message: 'If an account exists, a reset link was sent to your email.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordToken = hashed;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // In production, email the link. Here we log + return token in dev for testing.
  const resetUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/reset-password?token=${token}`;
  console.log(`[password-reset] ${email} → ${resetUrl}`);

  const devToken = process.env.NODE_ENV === 'production' ? undefined : token;
  res.json({
    message: 'If an account exists, a reset link was sent to your email.',
    devResetUrl: process.env.NODE_ENV === 'production' ? undefined : resetUrl,
    devToken,
  });
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password required' });
  if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 chars' });

  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  const jwtToken = signToken(user._id);
  res.json({
    message: 'Password reset successfully',
    token: jwtToken,
    user: { id: user._id, name: user.name, email: user.email, avatarColor: user.avatarColor, profilePic: user.profilePic },
  });
};

// POST /api/auth/verify-email/request  (generate token)
const requestEmailVerification = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.emailVerified) return res.json({ message: 'Already verified' });

  const token = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  user.emailVerifyToken = hashed;
  await user.save();

  const verifyUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/verify-email?token=${token}`;
  console.log(`[email-verify] ${user.email} → ${verifyUrl}`);

  res.json({
    message: 'Verification email sent',
    devVerifyUrl: process.env.NODE_ENV === 'production' ? undefined : verifyUrl,
  });
};

// POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Token required' });

  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ emailVerifyToken: hashed }).select('+emailVerifyToken');
  if (!user) return res.status(400).json({ message: 'Invalid verification token' });

  user.emailVerified = true;
  user.emailVerifyToken = null;
  await user.save();
  res.json({ message: 'Email verified successfully' });
};

// PATCH /api/auth/notification-prefs
const updateNotificationPrefs = async (req, res) => {
  const allowed = ['taskAssigned', 'taskCommented', 'taskDue', 'workspaceInvite', 'memberJoined', 'weeklyDigest', 'emailUpdates'];
  const updates = {};
  for (const k of allowed) {
    if (typeof req.body[k] === 'boolean') updates[`notificationPrefs.${k}`] = req.body[k];
  }
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json({ user });
};

// PATCH /api/auth/theme
const updateTheme = async (req, res) => {
  const { theme } = req.body;
  if (!['dark', 'light', 'system'].includes(theme)) return res.status(400).json({ message: 'Invalid theme' });
  const user = await User.findByIdAndUpdate(req.user._id, { themePreference: theme }, { new: true });
  res.json({ user });
};

// DELETE /api/auth/account
const deleteAccount = async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Incorrect password' });
  }
  await user.deleteOne();
  res.json({ message: 'Account deleted successfully' });
};

module.exports = {
  register, login, me, uploadProfilePic, updateProfile, changePassword,
  forgotPassword, resetPassword, requestEmailVerification, verifyEmail,
  updateNotificationPrefs, updateTheme, deleteAccount,
};
