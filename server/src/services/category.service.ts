import prisma from '../lib/prisma';

export class CategoryService {
  static async getCategories(userId: string) {
    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            tasks: {
              where: { isCompleted: false },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return categories.map((cat) => ({
      ...cat,
      taskCount: cat._count.tasks,
      _count: undefined,
    }));
  }

  static async createCategory(userId: string, data: { name: string; color?: string }) {
    return prisma.category.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  static async updateCategory(userId: string, id: string, data: { name?: string; color?: string }) {
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return prisma.category.update({
      where: { id },
      data,
    });
  }

  static async deleteCategory(userId: string, id: string) {
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    if (category.isDefault) {
      throw new Error('Default categories cannot be deleted');
    }

    await prisma.category.delete({
      where: { id },
    });
  }
}
