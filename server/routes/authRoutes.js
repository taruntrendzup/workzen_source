import express from 'express';
import {
  register,
  login,
  verifyEmail,
  resendEmailVerification,
  requestRecoveryCode,
  verifyRecoveryCode,
  requestEmailChangeCode,
  confirmEmailChange,
  requestPasswordChangeCode,
  confirmPasswordChange,
  getMe,
  getUsers,
  terminateUser,
  restoreUser,
  updateProfile,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendEmailVerification);
router.post('/recovery/request-code', requestRecoveryCode);
router.post('/recovery/verify-code', verifyRecoveryCode);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/account/email/request-code', protect, requestEmailChangeCode);
router.post('/account/email/confirm', protect, confirmEmailChange);
router.post('/account/password/request-code', protect, requestPasswordChangeCode);
router.post('/account/password/confirm', protect, confirmPasswordChange);
router.get('/users', protect, getUsers);
router.put('/users/:userId/terminate', protect, authorize('admin'), terminateUser);
router.put('/users/:userId/restore', protect, authorize('admin'), restoreUser);

export default router;
