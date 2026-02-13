import { NextFunction, Request, Response } from 'express';
import { TaskQuery, TaskService } from '../services/task.service';

export class TaskController {
  static async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as TaskQuery;
      const result = await TaskService.getTasks((req as any).userId!, query);
      res.json({ tasks: result });
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TaskService.createTask((req as any).userId!, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.getTaskById((req as any).userId!, req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TaskService.updateTask((req as any).userId!, req.params.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      await TaskService.deleteTask((req as any).userId!, req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async reorderTasks(req: Request, res: Response, next: NextFunction) {
    try {
      await TaskService.reorderTasks((req as any).userId!, req.body.tasks);
      res.json({ message: 'Tasks reordered successfully' });
    } catch (error) {
      next(error);
    }
  }
}
