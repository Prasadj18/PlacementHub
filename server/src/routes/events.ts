import { Router } from 'express';
import { eventController } from '../controllers/events.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authMiddleware);

router.get('/', eventController.findAll.bind(eventController));
router.get('/:id', eventController.findById.bind(eventController));

router.post(
  '/',
  validate([
    { field: 'companyId', required: true, type: 'string' },
    { field: 'type', required: true, type: 'string' },
    { field: 'title', required: true, type: 'string' },
    { field: 'dateTime', required: true, type: 'string' },
  ]),
  eventController.create.bind(eventController)
);

router.put('/:id', eventController.update.bind(eventController));
router.delete('/:id', eventController.delete.bind(eventController));

export default router;
