const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { loadWorkspace, requireRole } = require('../middleware/rbac');
const { cache, clearCache } = require('../middleware/cache');
const ctrl = require('../controllers/workspaceController');

// All workspace routes require auth
router.use(protect);

router.get('/', cache('user_workspaces'), ctrl.listMyWorkspaces);
router.post('/', ctrl.createWorkspace);
router.post('/join', ctrl.joinByInvite);

router.get('/:id', loadWorkspace, ctrl.getWorkspace);
router.patch('/:id', loadWorkspace, requireRole('admin'), ctrl.updateWorkspace);
router.delete('/:id', loadWorkspace, ctrl.deleteWorkspace);

// Member management
router.patch('/:id/members/:memberId', loadWorkspace, requireRole('admin'), ctrl.updateMemberRole);
router.delete('/:id/members/:memberId', loadWorkspace, ctrl.removeMember);

module.exports = router;
