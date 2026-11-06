import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('admin', 'manager'), createProject);

router.route('/:id')
  .get(getProjectById)
  .put(authorize('admin', 'manager'), updateProject)
  .delete(authorize('admin'), deleteProject);

export default router;
