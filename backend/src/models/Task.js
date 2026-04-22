const mongoose = require('mongoose');

const STATUSES = ['todo', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 1,
      maxlength: 140,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: 'medium',
    },
    tags: {
      type: [String],
      default: [],
    },
    labels: [
      {
        name: { type: String, required: true, maxlength: 30 },
        color: { type: String, default: '#6366f1' },
      },
    ],
    coverColor: {
      type: String,
      default: null,
    },
    subtasks: [
      {
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
      },
    ],
    watchers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    timeEstimate: {
      type: Number, // minutes
      default: 0,
    },
    timeSpent: {
      type: Number, // minutes
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

taskSchema.index({ workspace: 1, status: 1, order: 1 });

taskSchema.statics.STATUSES = STATUSES;
taskSchema.statics.PRIORITIES = PRIORITIES;

module.exports = mongoose.model('Task', taskSchema);
