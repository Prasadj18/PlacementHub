import { Response } from 'express';
import { activityLogService } from '../services/activityLog.service';
import { AuthRequest } from '../middleware/auth';

export class ActivityLogController {
  async findAll(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const logs = await activityLogService.findAll();
      res.json(logs);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async findByEntity(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { entity, entityId } = req.params;
      const logs = await activityLogService.findByEntity(entity, entityId);
      res.json(logs);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

export const activityLogController = new ActivityLogController();
