import { Router } from 'express';
import { applicationController } from '../controllers/applications.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', applicationController.findByUser.bind(applicationController));
router.post('/', applicationController.create.bind(applicationController));
router.patch('/:id', applicationController.updateStatus.bind(applicationController));

export default router;
