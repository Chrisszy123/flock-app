import { prisma } from '../config/database';

export const refreshTokenRepository = {
  /**
   * Creates a new refresh token
   */
  async create(data: { token: string; userId: string; expiresAt: Date }) {
    return prisma.refreshToken.create({
      data,
    });
  },

  /**
   * Finds a refresh token by token string
   */
  async findByToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  /**
   * Revokes a refresh token
   */
  async revoke(id: string, replacedBy?: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: {
        revoked: true,
        replacedBy,
      },
    });
  },

  /**
   * Revokes all refresh tokens for a user
   */
  async revokeAllForUser(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  },

  /**
   * Deletes expired tokens (cleanup job)
   */
  async deleteExpired() {
    return prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  },
};
