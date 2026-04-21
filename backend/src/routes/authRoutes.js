const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, me, uploadProfilePic, updateProfile, changePassword } = require('../controllers/authController');
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

router.patch(
  '/profile',
  protect,
  [
    body('name').optional().isString().trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 chars'),
    body('username').optional().isString().trim().isLength({ max: 30 }).matches(/^[a-zA-Z0-9_.-]*$/).withMessage('Username can only contain letters, numbers, underscores, dots, hyphens'),
    body('bio').optional().isString().trim().isLength({ max: 200 }).withMessage('Bio must be under 200 chars'),
    body('website').optional().isString().trim().isLength({ max: 100 }),
    body('location').optional().isString().trim().isLength({ max: 60 }),
    body('avatarColor').optional().isString().trim(),
  ],
  updateProfile
);

router.patch(
  '/change-password',
  protect,
  [
    body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 chars'),
  ],
  changePassword
);

module.exports = router;
