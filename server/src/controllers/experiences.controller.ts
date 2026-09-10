import { Response } from 'express';
import { experienceService } from '../services/experience.service';
import { AuthRequest } from '../middleware/auth';

export class ExperienceController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const companyId = req.query.companyId as string | undefined;
      const experiences = await experienceService.findAll(companyId);
      res.json(experiences);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const experience = await experienceService.create(req.body, req.user!.id);
      res.status(201).json(experience);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

export const experienceController = new ExperienceController();
