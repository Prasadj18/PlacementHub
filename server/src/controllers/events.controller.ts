import { Response } from 'express';
import { eventService } from '../services/event.service';
import { AuthRequest } from '../middleware/auth';

export class EventController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const companyId = req.query.companyId as string | undefined;
      const events = await eventService.findAll(companyId);
      res.json(events);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const event = await eventService.findById(req.params.id);
      res.json(event);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const event = await eventService.create(req.body, req.user!.id);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const event = await eventService.update(req.params.id, req.body, req.user!.id);
      res.json(event);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await eventService.delete(req.params.id, req.user!.id);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

export const eventController = new EventController();
