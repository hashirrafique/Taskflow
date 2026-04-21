const router = require('express').Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const { loadWorkspace } = require('../middleware/rbac');
const ctrl = require('../controllers/taskController');

router.use(protect);
router.use(loadWorkspace); // resolves :workspaceId, attaches req.workspace + req.workspaceRole

router.get('/', ctrl.listTasks);
router.post('/', ctrl.createTask);
router.patch('/:taskId', ctrl.updateTask);
router.delete('/:taskId', ctrl.deleteTask);
router.post('/:taskId/move', ctrl.moveTask);

module.exports = router;
