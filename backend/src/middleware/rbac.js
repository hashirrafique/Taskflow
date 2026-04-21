const Workspace = require('../models/Workspace');

// Role hierarchy: owner > admin > member > viewer
const ROLE_RANK = { owner: 4, admin: 3, member: 2, viewer: 1 };

/**
 * Resolve the workspace on req.params.workspaceId (or req.params.id),
 * then attach it and the caller's role to the request.
 * Rejects if the caller is not a member.
 */
const loadWorkspace = async (req, res, next) => {
  try {
    const id = req.params.workspaceId || req.params.id;
    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const role = workspace.getMemberRole(req.user._id);
    if (!role) return res.status(403).json({ message: 'Not a member of this workspace' });

    req.workspace = workspace;
    req.workspaceRole = role;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid workspace id' });
  }
};

/**
 * Require the caller to have at least the given role.
 * Must be used after loadWorkspace.
 * Example: requireRole('admin')
 */
const requireRole = (minRole) => (req, res, next) => {
  const have = ROLE_RANK[req.workspaceRole] || 0;
  const need = ROLE_RANK[minRole] || 0;
  if (have < need) {
    return res.status(403).json({
      message: `Forbidden: requires role '${minRole}' or higher (you are '${req.workspaceRole}')`,
    });
  }
  next();
};

module.exports = { loadWorkspace, requireRole, ROLE_RANK };
