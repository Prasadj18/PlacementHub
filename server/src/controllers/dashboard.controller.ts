import { Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { AuthRequest } from '../middleware/auth';

export class DashboardController {
  async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const dashboard = await dashboardService.getDashboard(req.user!.id);
      res.json(dashboard);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

export const dashboardController = new DashboardController();
