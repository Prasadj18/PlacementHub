import { Router } from 'express';
import { companyController } from '../controllers/companies.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authMiddleware);

router.get('/', companyController.findAll.bind(companyController));

router.get('/:id', companyController.findById.bind(companyController));

router.post(
  '/',
  validate([
    { field: 'name', required: true, type: 'string' },
    { field: 'role', required: true, type: 'string' },
  ]),
  companyController.create.bind(companyController)
);

router.put('/:id', companyController.update.bind(companyController));

router.delete('/:id', companyController.delete.bind(companyController));

export default router;
