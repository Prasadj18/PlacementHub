import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/register',
  validate([
    { field: 'name', required: true, type: 'string', minLength: 2 },
    { field: 'email', required: true, type: 'string' },
    { field: 'password', required: true, type: 'string', minLength: 6 },
    { field: 'branch', required: true, type: 'string' },
    { field: 'graduationYear', required: true },
  ]),
  authController.register.bind(authController)
);

router.post(
  '/login',
  validate([
    { field: 'email', required: true, type: 'string' },
    { field: 'password', required: true, type: 'string' },
  ]),
  authController.login.bind(authController)
);

router.get('/me', authMiddleware, authController.me.bind(authController));

export default router;
