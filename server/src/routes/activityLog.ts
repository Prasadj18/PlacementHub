import { Router } from 'express';
import { activityLogController } from '../controllers/activityLog.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', activityLogController.findAll.bind(activityLogController));
router.get('/:entity/:entityId', activityLogController.findByEntity.bind(activityLogController));

export default router;
