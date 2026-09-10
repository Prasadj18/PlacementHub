import { Response } from 'express';
import { companyService } from '../services/company.service';
import { AuthRequest } from '../middleware/auth';

export class CompanyController {
  async findAll(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const companies = await companyService.findAll();
      res.json(companies);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const company = await companyService.findById(req.params.id, req.user!.id);
      res.json(company);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await companyService.create(req.body, req.user!.id);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const company = await companyService.update(req.params.id, req.body, req.user!.id);
      res.json(company);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await companyService.delete(req.params.id, req.user!.id);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

export const companyController = new CompanyController();
