const mongoose = require('mongoose');

const ACTIONS = [
  'task.created',
  'task.updated',
  'task.deleted',
  'task.moved',
  'task.assigned',
  'task.completed',
  'subtask.added',
  'subtask.toggled',
  'comment.added',
  'comment.deleted',
  'workspace.updated',
  'member.joined',
  'member.left',
  'member.role_changed',
];

const activityLogSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ACTIONS, required: true },
    target: {
      type: { type: String, enum: ['task', 'comment', 'workspace', 'member'], default: 'task' },
      id: { type: mongoose.Schema.Types.ObjectId, default: null },
      name: { type: String, default: '' },
    },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activityLogSchema.index({ workspace: 1, createdAt: -1 });
activityLogSchema.statics.ACTIONS = ACTIONS;

module.exports = mongoose.model('ActivityLog', activityLogSchema);
