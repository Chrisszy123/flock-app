import { Router } from 'express';
import { authController } from '../controllers';
import { authenticate, validateBody } from '../middleware';
import { registerSchema, loginSchema } from '../validators';

const router = Router();

// Public routes
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Protected routes
router.post('/logout-all', authenticate, authController.logoutAll);
router.get('/me', authenticate, authController.me);

export { router as authRoutes };
