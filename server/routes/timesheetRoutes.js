import express from 'express';
import {
  getTimesheets,
  createTimesheet,
  updateTimesheet,
  deleteTimesheet,
  reviewTimesheet,
  bulkReviewTimesheets,
} from '../controllers/timesheetController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTimesheets)
  .post(createTimesheet);

router.post('/bulk-approve', authorize('admin', 'manager'), bulkReviewTimesheets);

router.route('/:id')
  .put(updateTimesheet)
  .delete(deleteTimesheet);

router.put('/:id/approve', authorize('admin', 'manager'), reviewTimesheet);

export default router;
