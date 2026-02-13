import { comparePassword, hashPassword } from '../lib/password';
import prisma from '../lib/prisma';

export class UserService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  static async updateProfile(userId: string, name: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid current password');
    }

    const passwordHash = await hashPassword(newPassword);

    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: {
        id: true,
        email: true
      }
    });
  }
}
