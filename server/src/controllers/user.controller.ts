import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.getProfile((req as any).userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const result = await UserService.updateProfile((req as any).userId!, name);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await UserService.changePassword((req as any).userId!, currentPassword, newPassword);
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }
}
