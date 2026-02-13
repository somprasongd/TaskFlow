import { NextFunction, Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

export class CategoryController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CategoryService.getCategories((req as any).userId!);
      res.json({ categories: result });
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CategoryService.createCategory((req as any).userId!, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CategoryService.updateCategory((req as any).userId!, req.params.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      await CategoryService.deleteCategory((req as any).userId!, req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Default categories')) {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }
}
