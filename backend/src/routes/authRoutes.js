const express = require('express');
const router = express.Router();
const { register, login, getProfile, getUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.get('/users', protect, authorize('SUPERVISOR', 'ADMIN'), getUsers);

module.exports = router;
