const ActivityLog = require('../models/ActivityLog');

// GET /api/workspaces/:workspaceId/activity
const listActivity = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 40, 100);
  const activities = await ActivityLog.find({ workspace: req.workspace._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actor', 'name avatarColor profilePic');
  res.json({ activities });
};

module.exports = { listActivity };
