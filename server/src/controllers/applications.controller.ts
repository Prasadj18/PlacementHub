import { Response } from 'express';
import { applicationService } from '../services/application.service';
import { AuthRequest } from '../middleware/auth';

export class ApplicationController {
  async findByUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const applications = await applicationService.findByUser(req.user!.id);
      res.json(applications);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const application = await applicationService.create(req.user!.id, req.body.companyId);
      res.status(201).json(application);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const application = await applicationService.updateStatus(
        req.params.id,
        req.body.status,
        req.user!.id
      );
      res.json(application);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

export const applicationController = new ApplicationController();
