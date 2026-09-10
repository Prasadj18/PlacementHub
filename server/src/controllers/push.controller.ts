import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { env } from '../config/env';
import { pushService } from '../services/push.service';

export class PushController {
  async subscribe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const subscription = await pushService.saveSubscription(req.user!.id, req.body);
      res.status(201).json(subscription);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async unsubscribe(req: AuthRequest, res: Response): Promise<void> {
    try {
      await pushService.removeSubscription(req.user!.id, req.body);
      res.status(204).send();
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async publicKey(_req: AuthRequest, res: Response): Promise<void> {
    try {
      res.json({ publicKey: pushService.getPublicKey() });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async test(req: AuthRequest, res: Response): Promise<void> {
    if (env.NODE_ENV === 'production') {
      res.status(404).json({ error: 'Route not found' });
      return;
    }

    try {
      await pushService.sendToUser(req.user!.id, {
        title: 'PlacementHub Test',
        body: 'Push notifications are working!',
        url: '/notifications',
      });
      res.json({ message: 'Test push notification sent' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

export const pushController = new PushController();
