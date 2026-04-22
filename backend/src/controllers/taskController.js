const Task = require('../models/Task');
const Workspace = require('../models/Workspace');
const Comment = require('../models/Comment');
const { emitToWorkspace } = require('../socket');
const { createNotification, logActivity } = require('../services/notificationService');

// GET /api/workspaces/:workspaceId/tasks
const listTasks = async (req, res) => {
  const tasks = await Task.find({ workspace: req.workspace._id })
    .sort({ status: 1, order: 1, createdAt: 1 })
    .populate('createdBy', 'name email avatarColor')
    .populate('assignedTo', 'name email avatarColor');
  res.json({ tasks });
};

// POST /api/workspaces/:workspaceId/tasks
const createTask = async (req, res) => {
  if (req.workspaceRole === 'viewer') {
    return res.status(403).json({ message: 'Viewers cannot create tasks' });
  }

  const { title, description, priority, status, assignedTo, dueDate } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  // Assignee must be a member (or owner)
  if (assignedTo) {
    const role = req.workspace.getMemberRole(assignedTo);
    if (!role) return res.status(400).json({ message: 'Assignee must be a workspace member' });
  }

  // Append to end of column
  const last = await Task.findOne({
    workspace: req.workspace._id,
    status: status || 'todo',
  }).sort({ order: -1 });

  const task = await Task.create({
    title: title.trim(),
    description: description?.trim() || '',
    status: status || 'todo',
    priority: priority || 'medium',
    workspace: req.workspace._id,
    createdBy: req.user._id,
    assignedTo: assignedTo || null,
    dueDate: dueDate || null,
    order: last ? last.order + 1 : 0,
  });

  const populated = await Task.findById(task._id)
    .populate('createdBy', 'name email avatarColor')
    .populate('assignedTo', 'name email avatarColor');

  emitToWorkspace(req.workspace._id, 'task:created', populated);

  logActivity({
    workspace: req.workspace._id,
    actor: req.user._id,
    action: 'task.created',
    target: { type: 'task', id: task._id, name: task.title },
  });

  if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
    createNotification({
      user: assignedTo,
      type: 'task_assigned',
      title: `${req.user.name} assigned a task to you`,
      body: task.title,
      workspace: req.workspace._id,
      task: task._id,
      actor: req.user._id,
      link: `/workspaces/${req.workspace._id}`,
    });
  }

  res.status(201).json({ task: populated });
};

// PATCH /api/workspaces/:workspaceId/tasks/:taskId
const updateTask = async (req, res) => {
  if (req.workspaceRole === 'viewer') {
    return res.status(403).json({ message: 'Viewers cannot edit tasks' });
  }

  const { taskId } = req.params;
  const task = await Task.findOne({ _id: taskId, workspace: req.workspace._id });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const { title, description, priority, status, assignedTo, dueDate, order, labels, coverColor, timeEstimate, timeSpent, startDate } = req.body;

  const prevAssignee = task.assignedTo?.toString();
  const prevStatus = task.status;

  if (assignedTo !== undefined) {
    if (assignedTo === null || assignedTo === '') {
      task.assignedTo = null;
    } else {
      const role = req.workspace.getMemberRole(assignedTo);
      if (!role) return res.status(400).json({ message: 'Assignee must be a workspace member' });
      task.assignedTo = assignedTo;
    }
  }
  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description.trim();
  if (priority !== undefined) task.priority = priority;
  if (status !== undefined) {
    task.status = status;
    if (status === 'done' && prevStatus !== 'done') task.completedAt = new Date();
    if (status !== 'done') task.completedAt = null;
  }
  if (dueDate !== undefined) task.dueDate = dueDate || null;
  if (order !== undefined) task.order = order;
  if (labels !== undefined) task.labels = labels;
  if (coverColor !== undefined) task.coverColor = coverColor;
  if (timeEstimate !== undefined) task.timeEstimate = timeEstimate;
  if (timeSpent !== undefined) task.timeSpent = timeSpent;
  if (startDate !== undefined) task.startDate = startDate || null;

  await task.save();
  const populated = await Task.findById(task._id)
    .populate('createdBy', 'name email avatarColor')
    .populate('assignedTo', 'name email avatarColor');

  emitToWorkspace(req.workspace._id, 'task:updated', populated);

  logActivity({
    workspace: req.workspace._id,
    actor: req.user._id,
    action: status === 'done' && prevStatus !== 'done' ? 'task.completed' : 'task.updated',
    target: { type: 'task', id: task._id, name: task.title },
  });

  const newAssignee = task.assignedTo?.toString();
  if (newAssignee && newAssignee !== prevAssignee && newAssignee !== req.user._id.toString()) {
    createNotification({
      user: newAssignee,
      type: 'task_assigned',
      title: `${req.user.name} assigned a task to you`,
      body: task.title,
      workspace: req.workspace._id,
      task: task._id,
      actor: req.user._id,
      link: `/workspaces/${req.workspace._id}`,
    });
  }

  res.json({ task: populated });
};

// DELETE /api/workspaces/:workspaceId/tasks/:taskId
const deleteTask = async (req, res) => {
  if (req.workspaceRole === 'viewer') {
    return res.status(403).json({ message: 'Viewers cannot delete tasks' });
  }

  const { taskId } = req.params;
  const task = await Task.findOne({ _id: taskId, workspace: req.workspace._id });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const taskTitle = task.title;
  await task.deleteOne();
  emitToWorkspace(req.workspace._id, 'task:deleted', { _id: taskId });
  logActivity({
    workspace: req.workspace._id,
    actor: req.user._id,
    action: 'task.deleted',
    target: { type: 'task', id: taskId, name: taskTitle },
  });
  res.json({ message: 'Task deleted' });
};

// POST /api/workspaces/:workspaceId/tasks/:taskId/move
// body: { status, order }
const moveTask = async (req, res) => {
  if (req.workspaceRole === 'viewer') {
    return res.status(403).json({ message: 'Viewers cannot move tasks' });
  }

  const { taskId } = req.params;
  const { status, order } = req.body;
  if (!Task.STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const task = await Task.findOne({ _id: taskId, workspace: req.workspace._id });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const prevStatus = task.status;
  task.status = status;
  task.order = typeof order === 'number' ? order : 0;
  if (status === 'done' && prevStatus !== 'done') task.completedAt = new Date();
  if (status !== 'done') task.completedAt = null;
  await task.save();

  const populated = await Task.findById(task._id)
    .populate('createdBy', 'name email avatarColor')
    .populate('assignedTo', 'name email avatarColor');

  emitToWorkspace(req.workspace._id, 'task:moved', populated);

  if (prevStatus !== status) {
    logActivity({
      workspace: req.workspace._id,
      actor: req.user._id,
      action: status === 'done' ? 'task.completed' : 'task.moved',
      target: { type: 'task', id: task._id, name: task.title },
      meta: { from: prevStatus, to: status },
    });
  }

  res.json({ task: populated });
};

// Subtasks
const addSubtask = async (req, res) => {
  const { taskId } = req.params;
  const { title } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: 'Subtask title required' });

  const task = await Task.findOne({ _id: taskId, workspace: req.workspace._id });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  task.subtasks.push({ title: title.trim(), isCompleted: false });
  await task.save();

  const populated = await Task.findById(task._id).populate('createdBy assignedTo', 'name email avatarColor');
  emitToWorkspace(req.workspace._id, 'task:updated', populated);
  res.status(201).json({ task: populated });
};

const toggleSubtask = async (req, res) => {
  const { taskId, subtaskId } = req.params;
  const { isCompleted } = req.body;

  const task = await Task.findOne({ _id: taskId, workspace: req.workspace._id });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const sub = task.subtasks.id(subtaskId);
  if (!sub) return res.status(404).json({ message: 'Subtask not found' });

  sub.isCompleted = isCompleted;
  await task.save();

  const populated = await Task.findById(task._id).populate('createdBy assignedTo', 'name email avatarColor');
  emitToWorkspace(req.workspace._id, 'task:updated', populated);
  res.json({ task: populated });
};

const deleteSubtask = async (req, res) => {
  const { taskId, subtaskId } = req.params;
  const task = await Task.findOne({ _id: taskId, workspace: req.workspace._id });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  task.subtasks.pull(subtaskId);
  await task.save();

  const populated = await Task.findById(task._id).populate('createdBy assignedTo', 'name email avatarColor');
  emitToWorkspace(req.workspace._id, 'task:updated', populated);
  res.json({ task: populated });
};

// Comments
const addComment = async (req, res) => {
  const { taskId } = req.params;
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ message: 'Comment text required' });

  const task = await Task.findOne({ _id: taskId, workspace: req.workspace._id });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const comment = await Comment.create({
    task: task._id,
    workspace: req.workspace._id,
    author: req.user._id,
    text: text.trim(),
  });

  const populated = await Comment.findById(comment._id).populate('author', 'name avatarColor');
  emitToWorkspace(req.workspace._id, 'comment:created', populated);

  logActivity({
    workspace: req.workspace._id,
    actor: req.user._id,
    action: 'comment.added',
    target: { type: 'task', id: task._id, name: task.title },
  });

  // Notify task assignee + creator (dedup)
  const notifyIds = new Set();
  if (task.assignedTo) notifyIds.add(task.assignedTo.toString());
  if (task.createdBy) notifyIds.add(task.createdBy.toString());
  notifyIds.delete(req.user._id.toString());
  for (const uid of notifyIds) {
    createNotification({
      user: uid,
      type: 'task_commented',
      title: `${req.user.name} commented on "${task.title}"`,
      body: text.trim().slice(0, 120),
      workspace: req.workspace._id,
      task: task._id,
      actor: req.user._id,
      link: `/workspaces/${req.workspace._id}`,
    });
  }

  res.status(201).json({ comment: populated });
};

const listComments = async (req, res) => {
  const { taskId } = req.params;
  const comments = await Comment.find({ task: taskId, workspace: req.workspace._id })
    .sort({ createdAt: 1 })
    .populate('author', 'name avatarColor');
  res.json({ comments });
};

const deleteComment = async (req, res) => {
  const { taskId, commentId } = req.params;
  const comment = await Comment.findOne({ _id: commentId, task: taskId, workspace: req.workspace._id });
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  if (comment.author.toString() !== req.user._id.toString() && req.workspaceRole !== 'owner' && req.workspaceRole !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete this comment' });
  }

  await comment.deleteOne();
  emitToWorkspace(req.workspace._id, 'comment:deleted', { _id: commentId, taskId });
  res.json({ message: 'Comment deleted' });
};

module.exports = { 
  listTasks, createTask, updateTask, deleteTask, moveTask,
  addSubtask, toggleSubtask, deleteSubtask,
  addComment, listComments, deleteComment
};
