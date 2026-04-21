const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never return by default
    },
    avatarColor: {
      type: String,
      default: '#6366f1',
    },
    profilePic: {
      type: String,
      default: null,
    },
    username: {
      type: String,
      trim: true,
      maxlength: 30,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    website: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 60,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Safe JSON output (never leak password)
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
