import { prisma } from '../config/database';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { getSkipOffset } from '../utils';

export const titheOfferingRepository = {
  async create(data: {
    userId: string;
    amount: number;
    method: PaymentMethod;
    transactionReference?: string;
    cryptoWalletAddress?: string;
    proofImageUrl?: string;
  }) {
    return prisma.titheOffering.create({
      data,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  },

  async findById(id: string) {
    return prisma.titheOffering.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  },

  async findByUser(userId: string, page: number, limit: number) {
    const skip = getSkipOffset(page, limit);
    const [offerings, total] = await Promise.all([
      prisma.titheOffering.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.titheOffering.count({ where: { userId } }),
    ]);
    return { offerings, total };
  },

  async findAll(
    page: number,
    limit: number,
    method?: PaymentMethod,
    status?: PaymentStatus
  ) {
    const skip = getSkipOffset(page, limit);
    const where: any = {};
    if (method) where.method = method;
    if (status) where.status = status;

    const [offerings, total] = await Promise.all([
      prisma.titheOffering.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
      }),
      prisma.titheOffering.count({ where }),
    ]);
    return { offerings, total };
  },

  async confirm(id: string, confirmedById: string) {
    return prisma.titheOffering.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedById,
        confirmedAt: new Date(),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  },

  async getStats(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalAmount, totalCount, confirmedAmount, pendingCount] = await Promise.all([
      prisma.titheOffering.aggregate({
        where: { ...where, status: 'CONFIRMED' },
        _sum: { amount: true },
      }),
      prisma.titheOffering.count({ where }),
      prisma.titheOffering.aggregate({
        where: { ...where, status: 'CONFIRMED' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.titheOffering.count({ where: { ...where, status: 'PENDING' } }),
    ]);

    return {
      totalConfirmedAmount: totalAmount._sum.amount || 0,
      totalRecords: totalCount,
      confirmedCount: confirmedAmount._count || 0,
      pendingCount,
    };
  },
};
