const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTaskStatus } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTasks)
  .post(protect, authorize('SUPERVISOR', 'ADMIN'), createTask);

router.route('/:id/status')
  .patch(protect, updateTaskStatus);

module.exports = router;
