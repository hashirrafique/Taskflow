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

// Subtasks
router.post('/:taskId/subtasks', ctrl.addSubtask);
router.patch('/:taskId/subtasks/:subtaskId', ctrl.toggleSubtask);
router.delete('/:taskId/subtasks/:subtaskId', ctrl.deleteSubtask);

// Comments
router.post('/:taskId/comments', ctrl.addComment);
router.get('/:taskId/comments', ctrl.listComments);
router.delete('/:taskId/comments/:commentId', ctrl.deleteComment);

module.exports = router;
