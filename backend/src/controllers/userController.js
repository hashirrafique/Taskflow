const Task = require('../models/Task');
const Workspace = require('../models/Workspace');
const mongoose = require('mongoose');

// GET /api/me/tasks — tasks assigned to the current user across all workspaces
const listMyTasks = async (req, res) => {
  const workspaces = await Workspace.find({
    $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
  }).select('_id name color');

  const wsIds = workspaces.map((w) => w._id);
  const wsMap = Object.fromEntries(workspaces.map((w) => [w._id.toString(), w]));

  const { status, priority, dueRange } = req.query;
  const filter = { assignedTo: req.user._id, workspace: { $in: wsIds } };

  if (status && status !== 'all') filter.status = status;
  if (priority && priority !== 'all') filter.priority = priority;

  if (dueRange === 'overdue') {
    filter.dueDate = { $lt: new Date(), $ne: null };
    filter.status = { $ne: 'done' };
  } else if (dueRange === 'today') {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    filter.dueDate = { $gte: start, $lte: end };
  } else if (dueRange === 'week') {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setDate(end.getDate() + 7);
    filter.dueDate = { $gte: start, $lte: end };
  }

  const tasks = await Task.find(filter)
    .sort({ dueDate: 1, priority: -1, createdAt: -1 })
    .populate('createdBy assignedTo', 'name email avatarColor profilePic')
    .lean();

  const enriched = tasks.map((t) => ({
    ...t,
    workspaceName: wsMap[t.workspace.toString()]?.name,
    workspaceColor: wsMap[t.workspace.toString()]?.color,
  }));

  res.json({ tasks: enriched });
};

// GET /api/search?q=...
const globalSearch = async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 2) return res.json({ tasks: [], workspaces: [] });

  const workspaces = await Workspace.find({
    $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
  }).select('_id name color description');

  const wsIds = workspaces.map((w) => w._id);
  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const [tasks, workspaceMatches] = await Promise.all([
    Task.find({ workspace: { $in: wsIds }, $or: [{ title: re }, { description: re }] })
      .limit(20)
      .sort({ updatedAt: -1 })
      .populate('assignedTo', 'name avatarColor')
      .lean(),
    workspaces.filter((w) => re.test(w.name) || (w.description && re.test(w.description))),
  ]);

  const wsMap = Object.fromEntries(workspaces.map((w) => [w._id.toString(), w]));
  const enriched = tasks.map((t) => ({
    ...t,
    workspaceName: wsMap[t.workspace.toString()]?.name,
    workspaceColor: wsMap[t.workspace.toString()]?.color,
  }));

  res.json({ tasks: enriched, workspaces: workspaceMatches });
};

// GET /api/analytics/overview
const analyticsOverview = async (req, res) => {
  const workspaces = await Workspace.find({
    $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
  }).select('_id name color');
  const wsIds = workspaces.map((w) => w._id);

  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);

  const [byStatus, byPriority, recentCompleted, overdue, upcoming, weeklyCreated] = await Promise.all([
    Task.aggregate([
      { $match: { workspace: { $in: wsIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Task.aggregate([
      { $match: { workspace: { $in: wsIds } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Task.countDocuments({ workspace: { $in: wsIds }, status: 'done', updatedAt: { $gte: weekAgo } }),
    Task.countDocuments({ workspace: { $in: wsIds }, status: { $ne: 'done' }, dueDate: { $lt: now, $ne: null } }),
    Task.countDocuments({ workspace: { $in: wsIds }, status: { $ne: 'done' }, dueDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } }),
    Task.aggregate([
      { $match: { workspace: { $in: wsIds }, createdAt: { $gte: weekAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const statusMap = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
  const priorityMap = Object.fromEntries(byPriority.map((p) => [p._id, p.count]));

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    const match = weeklyCreated.find((w) => w._id === key);
    days.push({
      date: key,
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      count: match ? match.count : 0,
    });
  }

  const totalTasks = byStatus.reduce((a, s) => a + s.count, 0);
  const completionRate = totalTasks > 0 ? Math.round(((statusMap.done || 0) / totalTasks) * 100) : 0;

  res.json({
    totals: {
      workspaces: workspaces.length,
      tasks: totalTasks,
      completed: statusMap.done || 0,
      inProgress: statusMap.in_progress || 0,
      inReview: statusMap.in_review || 0,
      todo: statusMap.todo || 0,
      completionRate,
      overdue,
      upcoming,
      completedThisWeek: recentCompleted,
    },
    byStatus: {
      todo: statusMap.todo || 0,
      in_progress: statusMap.in_progress || 0,
      in_review: statusMap.in_review || 0,
      done: statusMap.done || 0,
    },
    byPriority: {
      urgent: priorityMap.urgent || 0,
      high: priorityMap.high || 0,
      medium: priorityMap.medium || 0,
      low: priorityMap.low || 0,
    },
    weeklyActivity: days,
  });
};

module.exports = { listMyTasks, globalSearch, analyticsOverview };
