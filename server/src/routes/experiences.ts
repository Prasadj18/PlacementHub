import { Router } from 'express';
import { experienceController } from '../controllers/experiences.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authMiddleware);

router.get('/', experienceController.findAll.bind(experienceController));

router.post(
  '/',
  validate([
    { field: 'companyId', required: true, type: 'string' },
    { field: 'round', required: true, type: 'string' },
    { field: 'content', required: true, type: 'string' },
    { field: 'difficulty', required: true, type: 'string' },
  ]),
  experienceController.create.bind(experienceController)
);

export default router;
