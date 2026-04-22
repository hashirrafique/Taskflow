const router = require('express').Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const { loadWorkspace } = require('../middleware/rbac');
const { listActivity } = require('../controllers/activityController');

router.use(protect);
router.use(loadWorkspace);

router.get('/', listActivity);

module.exports = router;
