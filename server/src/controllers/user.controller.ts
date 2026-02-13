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
      const user = await UserService.changePassword((req as any).userId!, currentPassword, newPassword);

      // We need to generate NEW tokens because the old ones might be invalidated or 
      // just to follow best practices after a security event like password change.
      // But we DON'T want to logout.

      const { AuthService } = require('../services/auth.service');
      const tokens = await AuthService.generateTokens(user.id, user.email);

      res.json({
        message: 'Password updated successfully',
        ...tokens
      });
    } catch (error) {
      next(error);
    }
  }
}
