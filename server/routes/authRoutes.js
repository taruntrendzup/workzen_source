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

export default router;
