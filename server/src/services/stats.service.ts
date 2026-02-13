import prisma from '../lib/prisma';

export class StatsService {
  static async getStats(userId: string) {
    const [
      totalTasks,
      completedTasks,
      highPriorityTasks,
      categoryCount,
    ] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, isCompleted: true } }),
      prisma.task.count({ where: { userId, priority: 'HIGH' } }),
      prisma.category.count({ where: { userId } }),
    ]);

    const activeTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      activeTasks,
      completionRate,
      highPriorityTasks,
      categoryCount,
    };
  }
}
