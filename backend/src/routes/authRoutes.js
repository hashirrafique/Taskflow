const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, me, uploadProfilePic } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post(
  '/register',
  [
    body('name').isString().trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 chars'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 1 }).withMessage('Password required'),
  ],
  login
);

router.get('/me', protect, me);

router.post('/profile-pic', protect, upload.single('profilePic'), uploadProfilePic);

module.exports = router;
