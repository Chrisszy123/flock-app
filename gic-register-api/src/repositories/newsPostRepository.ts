import { prisma } from '../config/database';
import { NewsVisibility } from '@prisma/client';
import { getSkipOffset } from '../utils';

export const newsPostRepository = {
  async create(data: {
    title: string;
    content: string;
    visibility: NewsVisibility;
    createdById: string;
  }) {
    return prisma.newsPost.create({
      data,
      include: {
        createdBy: { select: { id: true, fullName: true, role: true } },
      },
    });
  },

  async findById(id: string) {
    return prisma.newsPost.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, fullName: true, role: true } },
      },
    });
  },

  async findAll(page: number, limit: number, visibility?: NewsVisibility) {
    const skip = getSkipOffset(page, limit);
    const where = visibility ? { visibility } : {};

    const [posts, total] = await Promise.all([
      prisma.newsPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, fullName: true, role: true } },
        },
      }),
      prisma.newsPost.count({ where }),
    ]);
    return { posts, total };
  },

  async findPublic(page: number, limit: number) {
    return this.findAll(page, limit, 'PUBLIC');
  },

  async update(id: string, data: {
    title?: string;
    content?: string;
    visibility?: NewsVisibility;
  }) {
    return prisma.newsPost.update({
      where: { id },
      data,
      include: {
        createdBy: { select: { id: true, fullName: true, role: true } },
      },
    });
  },

  async delete(id: string) {
    return prisma.newsPost.delete({ where: { id } });
  },
};
