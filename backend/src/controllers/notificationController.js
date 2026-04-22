const Notification = require('../models/Notification');

const list = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const filter = { user: req.user._id };
  if (req.query.unread === 'true') filter.read = false;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actor', 'name avatarColor profilePic');

  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ notifications, unreadCount });
};

const markRead = async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, user: req.user._id },
    { read: true }
  );
  res.json({ message: 'Marked as read' });
};

const markAllRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );
  res.json({ message: 'All notifications marked as read' });
};

const remove = async (req, res) => {
  await Notification.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Notification deleted' });
};

const clearAll = async (req, res) => {
  await Notification.deleteMany({ user: req.user._id });
  res.json({ message: 'All notifications cleared' });
};

module.exports = { list, markRead, markAllRead, remove, clearAll };
