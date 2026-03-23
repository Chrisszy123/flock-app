import { prisma } from '../config/database';
import { PermissionStatus } from '@prisma/client';
import { getSkipOffset } from '../utils';

export const permissionRequestRepository = {
  async create(data: {
    userId: string;
    reason: string;
    startDate: Date;
    endDate: Date;
  }) {
    return prisma.permissionRequest.create({
      data,
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true, directorateId: true, unitId: true } },
      },
    });
  },

  async findById(id: string) {
    return prisma.permissionRequest.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true, directorateId: true, unitId: true, isSuspended: true } },
        approvedBy: { select: { id: true, fullName: true, role: true } },
      },
    });
  },

  async findByUser(userId: string, page: number, limit: number) {
    const skip = getSkipOffset(page, limit);
    const [requests, total] = await Promise.all([
      prisma.permissionRequest.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          approvedBy: { select: { id: true, fullName: true, role: true } },
        },
      }),
      prisma.permissionRequest.count({ where: { userId } }),
    ]);
    return { requests, total };
  },

  async findPending(page: number, limit: number, directorateId?: string, unitId?: string) {
    const skip = getSkipOffset(page, limit);
    const where: any = { status: 'PENDING' as PermissionStatus };

    if (directorateId) {
      where.user = { directorateId };
    }
    if (unitId) {
      where.user = { ...where.user, unitId };
    }

    const [requests, total] = await Promise.all([
      prisma.permissionRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, role: true, directorateId: true, unitId: true } },
        },
      }),
      prisma.permissionRequest.count({ where }),
    ]);
    return { requests, total };
  },

  async findAll(page: number, limit: number, status?: PermissionStatus) {
    const skip = getSkipOffset(page, limit);
    const where = status ? { status } : {};

    const [requests, total] = await Promise.all([
      prisma.permissionRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, role: true } },
          approvedBy: { select: { id: true, fullName: true, role: true } },
        },
      }),
      prisma.permissionRequest.count({ where }),
    ]);
    return { requests, total };
  },

  async decide(id: string, data: {
    status: PermissionStatus;
    decisionReason: string;
    approvedById: string;
  }) {
    return prisma.permissionRequest.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
        approvedBy: { select: { id: true, fullName: true, role: true } },
      },
    });
  },
};
