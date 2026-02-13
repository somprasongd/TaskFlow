import { Priority, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export interface TaskQuery {
  search?: string;
  priority?: string;
  categoryId?: string;
  status?: 'all' | 'active' | 'completed';
  sortBy?: 'manual' | 'createdAt' | 'dueDate' | 'priority' | 'alphabetical';
}

export class TaskService {
  static async getTasks(userId: string, query: TaskQuery) {
    const { search, priority, categoryId, status, sortBy = 'manual' } = query;

    const where: Prisma.TaskWhereInput = {
      userId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (priority) {
      const priorities = priority.split(',').map((p) => p.toUpperCase()) as Priority[];
      where.priority = { in: priorities };
    }

    if (categoryId) {
      where.categoryId = categoryId === 'null' ? null : categoryId;
    }

    if (status === 'active') {
      where.isCompleted = false;
    } else if (status === 'completed') {
      where.isCompleted = true;
    }

    let orderBy: Prisma.TaskOrderByWithRelationInput[] = [];

    // For all sorts except manual, completed tasks go to bottom if status=all
    const shouldPushCompletedToBottom = sortBy !== 'manual' && status === 'all';
    if (shouldPushCompletedToBottom) {
      orderBy.push({ isCompleted: 'asc' });
    }

    switch (sortBy) {
      case 'createdAt':
        orderBy.push({ createdAt: 'desc' });
        break;
      case 'dueDate':
        orderBy.push({ dueDate: { sort: 'asc', nulls: 'last' } });
        break;
      case 'priority':
        // Priority is an enum: HIGH, MEDIUM, LOW. 
        // We want HIGH (3) > MEDIUM (2) > LOW (1).
        // Prisma doesn't support custom enum weights in orderBy easily.
        // We will sort in JS for priority if needed, or use a Raw query.
        // For simplicity, let's just do it in JS for priority sort if it's selected.
        break;
      case 'alphabetical':
        orderBy.push({ title: 'asc' });
        break;
      case 'manual':
      default:
        orderBy.push({ sortOrder: 'asc' });
        break;
    }

    let tasks = await prisma.task.findMany({
      where,
      orderBy,
      include: {
        category: true,
      },
    });

    if (sortBy === 'priority') {
      const priorityWeights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      tasks.sort((a, b) => {
        if (shouldPushCompletedToBottom) {
          if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
          }
        }
        return priorityWeights[b.priority] - priorityWeights[a.priority];
      });
    }

    return tasks;
  }

  static async getTaskById(userId: string, id: string) {
    return prisma.task.findFirst({
      where: { id, userId },
      include: {
        category: true,
      },
    });
  }

  static async createTask(userId: string, data: any) {
    // When creating a new task, we want it at the top (sortOrder = 0)
    // and increment all other tasks' sortOrder
    return prisma.$transaction(async (tx) => {
      await tx.task.updateMany({
        where: { userId },
        data: {
          sortOrder: { increment: 1 },
        },
      });

      return tx.task.create({
        data: {
          ...data,
          userId,
          sortOrder: 0,
        },
        include: {
          category: true,
        },
      });
    });
  }

  static async updateTask(userId: string, id: string, data: any) {
    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return prisma.task.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  static async deleteTask(userId: string, id: string) {
    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    await prisma.task.delete({
      where: { id },
    });
  }

  static async reorderTasks(userId: string, tasks: { id: string; sortOrder: number }[]) {
    await prisma.$transaction(
      tasks.map((task) =>
        prisma.task.update({
          where: { id: task.id, userId }, // Ensure user owns the task
          data: { sortOrder: task.sortOrder },
        })
      )
    );
  }
}
