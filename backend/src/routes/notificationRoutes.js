const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.use(protect);

router.get('/', ctrl.list);
router.patch('/:id/read', ctrl.markRead);
router.patch('/read-all', ctrl.markAllRead);
router.delete('/clear-all', ctrl.clearAll);
router.delete('/:id', ctrl.remove);

module.exports = router;
