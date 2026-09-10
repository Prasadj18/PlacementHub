import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { pushController } from '../controllers/push.controller';

const router = Router();

router.use(authMiddleware);
router.post('/subscribe', pushController.subscribe.bind(pushController));
router.delete('/subscribe', pushController.unsubscribe.bind(pushController));
router.get('/public-key', pushController.publicKey.bind(pushController));
router.post('/test', pushController.test.bind(pushController));

export default router;
