import { prisma } from '../config/database';
import { Role } from '@prisma/client';
import { getSkipOffset } from '../utils';

export const adminNotificationRepository = {
  async create(data: {
    title: string;
    message: string;
    targetRole?: Role | null;
    createdById: string;
  }) {
    return prisma.adminNotification.create({
      data,
      include: {
        createdBy: { select: { id: true, fullName: true, role: true } },
      },
    });
  },

  async findAll(page: number, limit: number) {
    const skip = getSkipOffset(page, limit);
    const [notifications, total] = await Promise.all([
      prisma.adminNotification.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, fullName: true, role: true } },
        },
      }),
      prisma.adminNotification.count(),
    ]);
    return { notifications, total };
  },

  async findRecent(limit: number = 10) {
    return prisma.adminNotification.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, fullName: true, role: true } },
      },
    });
  },
};
