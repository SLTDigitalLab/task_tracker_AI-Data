const express = require('express');
const router = express.Router();
const { getProjects, createProject, getProjectById, updateProject, updateProjectStatus } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('SUPERVISOR', 'ADMIN'), createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorize('SUPERVISOR', 'ADMIN'), updateProject);

router.route('/:id/status')
  .patch(protect, updateProjectStatus);

module.exports = router;
