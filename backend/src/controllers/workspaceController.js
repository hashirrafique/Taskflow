const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Task = require('../models/Task');
const { clearCache } = require('../middleware/cache');

// GET /api/workspaces -> list all workspaces where user is owner or member
const listMyWorkspaces = async (req, res) => {
  const uid = req.user._id;
  const workspaces = await Workspace.find({
    $or: [{ owner: uid }, { 'members.user': uid }],
  })
    .sort({ updatedAt: -1 })
    .populate('owner', 'name email avatarColor')
    .lean();

  // attach caller's role + task counts
  const withMeta = await Promise.all(
    workspaces.map(async (w) => {
      const isOwner = w.owner._id.toString() === uid.toString();
      const member = w.members.find((m) => m.user.toString() === uid.toString());
      const role = isOwner ? 'owner' : member?.role || 'member';
      const taskCount = await Task.countDocuments({ workspace: w._id });
      return { ...w, myRole: role, taskCount, memberCount: w.members.length + 1 };
    })
  );

  res.json({ workspaces: withMeta });
};

// POST /api/workspaces
const createWorkspace = async (req, res) => {
  const { name, description, color } = req.body;
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Workspace name must be at least 2 characters' });
  }

  const workspace = await Workspace.create({
    name: name.trim(),
    description: description?.trim() || '',
    color: color || '#6366f1',
    owner: req.user._id,
    members: [], // owner is implicit
  });

  await clearCache('user_workspaces')(req.user._id);
  res.status(201).json({ workspace });
};

// GET /api/workspaces/:id
const getWorkspace = async (req, res) => {
  const workspace = await Workspace.findById(req.workspace._id)
    .populate('owner', 'name email avatarColor')
    .populate('members.user', 'name email avatarColor')
    .lean();

  res.json({ workspace, myRole: req.workspaceRole });
};

// PATCH /api/workspaces/:id
const updateWorkspace = async (req, res) => {
  const { name, description, color } = req.body;
  const w = req.workspace;
  if (name !== undefined) w.name = name.trim();
  if (description !== undefined) w.description = description.trim();
  if (color !== undefined) w.color = color;
  await w.save();
  res.json({ workspace: w });
};

// DELETE /api/workspaces/:id -> owner only
const deleteWorkspace = async (req, res) => {
  if (req.workspaceRole !== 'owner') {
    return res.status(403).json({ message: 'Only the owner can delete this workspace' });
  }
  await Task.deleteMany({ workspace: req.workspace._id });
  await req.workspace.deleteOne();
  await clearCache('user_workspaces')(req.user._id);
  res.json({ message: 'Workspace deleted' });
};

// POST /api/workspaces/join  { inviteCode }
const joinByInvite = async (req, res) => {
  const { inviteCode } = req.body;
  if (!inviteCode) return res.status(400).json({ message: 'Invite code required' });

  const workspace = await Workspace.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
  if (!workspace) return res.status(404).json({ message: 'Invalid invite code' });

  const existingRole = workspace.getMemberRole(req.user._id);
  if (existingRole) {
    return res.status(409).json({ message: 'You are already a member', workspaceId: workspace._id });
  }

  workspace.members.push({ user: req.user._id, role: 'member' });
  await workspace.save();
  await clearCache('user_workspaces')(req.user._id);
  res.json({ message: 'Joined workspace', workspaceId: workspace._id });
};

// PATCH /api/workspaces/:id/members/:memberId  (change role) - admin+
const updateMemberRole = async (req, res) => {
  const { memberId } = req.params;
  const { role } = req.body;

  if (!Workspace.ROLES.includes(role) || role === 'owner') {
    return res.status(400).json({ message: 'Invalid role' });
  }

  if (req.workspace.owner.toString() === memberId) {
    return res.status(400).json({ message: 'Cannot change the owner\'s role' });
  }

  const member = req.workspace.members.find((m) => m.user.toString() === memberId);
  if (!member) return res.status(404).json({ message: 'Member not found' });

  member.role = role;
  await req.workspace.save();
  res.json({ message: 'Role updated' });
};

// DELETE /api/workspaces/:id/members/:memberId  - admin+ (or user removing self)
const removeMember = async (req, res) => {
  const { memberId } = req.params;
  const isSelf = memberId === req.user._id.toString();
  const rank = { owner: 4, admin: 3, member: 2, viewer: 1 };

  if (!isSelf && rank[req.workspaceRole] < rank.admin) {
    return res.status(403).json({ message: 'Only admins or owner can remove members' });
  }

  if (req.workspace.owner.toString() === memberId) {
    return res.status(400).json({ message: 'Cannot remove the owner' });
  }

  req.workspace.members = req.workspace.members.filter(
    (m) => m.user.toString() !== memberId
  );
  await req.workspace.save();
  res.json({ message: isSelf ? 'Left workspace' : 'Member removed' });
};

module.exports = {
  listMyWorkspaces,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  joinByInvite,
  updateMemberRole,
  removeMember,
};
