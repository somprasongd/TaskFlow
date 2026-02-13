import { NextFunction, Request, Response } from 'express';
import { StatsService } from '../services/stats.service';

export class StatsController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await StatsService.getStats((req as any).userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
