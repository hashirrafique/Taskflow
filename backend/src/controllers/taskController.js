const Task = require('../models/Task');
const Workspace = require('../models/Workspace');
const { emitToWorkspace } = require('../socket');

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

  const { title, description, priority, status, assignedTo, dueDate, order } = req.body;

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
  if (status !== undefined) task.status = status;
  if (dueDate !== undefined) task.dueDate = dueDate || null;
  if (order !== undefined) task.order = order;

  await task.save();
  const populated = await Task.findById(task._id)
    .populate('createdBy', 'name email avatarColor')
    .populate('assignedTo', 'name email avatarColor');

  emitToWorkspace(req.workspace._id, 'task:updated', populated);
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

  await task.deleteOne();
  emitToWorkspace(req.workspace._id, 'task:deleted', { _id: taskId });
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

  task.status = status;
  task.order = typeof order === 'number' ? order : 0;
  await task.save();

  const populated = await Task.findById(task._id)
    .populate('createdBy', 'name email avatarColor')
    .populate('assignedTo', 'name email avatarColor');

  emitToWorkspace(req.workspace._id, 'task:moved', populated);
  res.json({ task: populated });
};

module.exports = { listTasks, createTask, updateTask, deleteTask, moveTask };
