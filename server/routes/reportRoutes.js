import express from 'express';
import { getReportsSummary } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/summary', getReportsSummary);

export default router;
