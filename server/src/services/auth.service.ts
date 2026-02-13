import { v4 as uuidv4 } from 'uuid';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { comparePassword, hashPassword } from '../lib/password';
import prisma from '../lib/prisma';

export class AuthService {
  static async register(email: string, password: string, name?: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await hashPassword(password);
    const userName = name || email.split('@')[0];

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: userName,
        },
      });

      // Seed default categories
      await tx.category.createMany({
        data: [
          { name: 'Work', color: 'bg-blue-500', userId: newUser.id },
          { name: 'Personal', color: 'bg-purple-500', userId: newUser.id },
          { name: 'Study', color: 'bg-indigo-500', userId: newUser.id },
        ],
      });

      return newUser;
    });

    const tokens = await this.generateTokens(user.id, user.email);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  static async refresh(token: string) {
    try {
      const payload = verifyRefreshToken(token);

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) { // Prisma handles date comparison
        if (storedToken) {
          await prisma.refreshToken.delete({ where: { id: storedToken.id } });
        }
        throw new Error('Invalid or expired refresh token');
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Rotate tokens: delete old one, create new one
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });

      const tokens = await this.generateTokens(user.id, user.email);
      return tokens;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  static async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  private static async generateTokens(userId: string, email: string) {
    const accessToken = signAccessToken(userId, email);
    const tokenId = uuidv4();
    const refreshToken = signRefreshToken(userId, tokenId);

    // Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        id: tokenId,
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}
