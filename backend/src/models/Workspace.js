const mongoose = require('mongoose');
const crypto = require('crypto');

const ROLES = ['owner', 'admin', 'member', 'viewer'];

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: {
      type: [memberSchema],
      default: [],
    },
    inviteCode: {
      type: String,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Generate invite code before first save
workspaceSchema.pre('validate', function (next) {
  if (!this.inviteCode) {
    this.inviteCode = crypto.randomBytes(5).toString('hex').toUpperCase();
  }
  next();
});

// Helper: get a member's role (or null)
workspaceSchema.methods.getMemberRole = function (userId) {
  if (this.owner.toString() === userId.toString()) return 'owner';
  const m = this.members.find((x) => x.user.toString() === userId.toString());
  return m ? m.role : null;
};

workspaceSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('Workspace', workspaceSchema);
