import { Response } from 'express';
import { profileService } from '../services/profile.service';
import { AuthRequest } from '../middleware/auth';

export class ProfileController {
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const profile = await profileService.getProfile(req.user!.id);
      res.json(profile);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const profile = await profileService.updateProfile(req.user!.id, req.body);
      res.json(profile);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

export const profileController = new ProfileController();
