const { validationResult } = require('express-validator');
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

module.exports = { register, login, me, uploadProfilePic };
