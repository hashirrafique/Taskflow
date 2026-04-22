const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { listMyTasks, globalSearch, analyticsOverview } = require('../controllers/userController');

router.use(protect);
router.get('/tasks', listMyTasks);
router.get('/search', globalSearch);
router.get('/analytics', analyticsOverview);

module.exports = router;
