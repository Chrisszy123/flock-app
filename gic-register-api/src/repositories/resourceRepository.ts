import { prisma } from '../config/database';
import { ResourceType } from '@prisma/client';
import { getSkipOffset } from '../utils';

export const resourceRepository = {
  async create(data: {
    type: ResourceType;
    title: string;
    description?: string;
    fileUrl?: string;
    price?: number | null;
    excerpt?: string;
    coverUrl?: string;
  }) {
    return prisma.resource.create({ data });
  },

  async findById(id: string) {
    return prisma.resource.findUnique({ where: { id } });
  },

  async findAll(page: number, limit: number, type?: ResourceType) {
    const skip = getSkipOffset(page, limit);
    const where = type ? { type } : {};

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.resource.count({ where }),
    ]);
    return { resources, total };
  },

  async update(id: string, data: {
    title?: string;
    description?: string | null;
    fileUrl?: string | null;
    price?: number | null;
    excerpt?: string | null;
    coverUrl?: string | null;
  }) {
    return prisma.resource.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.resource.delete({ where: { id } });
  },
};
