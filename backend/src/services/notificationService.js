const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { emitToUser, emitToWorkspace } = require('../socket');

async function createNotification({ user, type, title, body, workspace, task, actor, link }) {
  if (actor && user && actor.toString() === user.toString()) return null; // no self-notify
  const n = await Notification.create({ user, type, title, body, workspace, task, actor, link });
  const populated = await Notification.findById(n._id).populate('actor', 'name avatarColor profilePic');
  try { emitToUser && emitToUser(user, 'notification:new', populated); } catch {}
  return populated;
}

async function logActivity({ workspace, actor, action, target, meta }) {
  if (!workspace || !actor || !action) return null;
  const log = await ActivityLog.create({
    workspace,
    actor,
    action,
    target: target || {},
    meta: meta || {},
  });
  const populated = await ActivityLog.findById(log._id).populate('actor', 'name avatarColor profilePic');
  try { emitToWorkspace && emitToWorkspace(workspace, 'activity:new', populated); } catch {}
  return populated;
}

module.exports = { createNotification, logActivity };
