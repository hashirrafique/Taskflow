const mongoose = require('mongoose');

const TYPES = [
  'task_assigned',
  'task_commented',
  'task_due_soon',
  'task_mention',
  'task_status_changed',
  'workspace_invite_accepted',
  'member_joined',
  'workspace_role_changed',
];

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: TYPES, required: true },
    title: { type: String, required: true, maxlength: 160 },
    body: { type: String, maxlength: 400, default: '' },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', default: null, index: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    read: { type: Boolean, default: false, index: true },
    link: { type: String, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.statics.TYPES = TYPES;

module.exports = mongoose.model('Notification', notificationSchema);
