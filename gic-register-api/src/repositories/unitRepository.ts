import { prisma } from '../config/database';
import { getSkipOffset } from '../utils';

export const unitRepository = {
  async create(data: { name: string; directorateId: string }) {
    return prisma.unit.create({
      data,
      include: { directorate: true },
    });
  },

  async findById(id: string) {
    return prisma.unit.findUnique({
      where: { id },
      include: {
        directorate: true,
        _count: { select: { members: true } },
      },
    });
  },

  async findByDirectorate(directorateId: string, page: number, limit: number) {
    const skip = getSkipOffset(page, limit);
    const [units, total] = await Promise.all([
      prisma.unit.findMany({
        where: { directorateId },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { members: true } },
        },
      }),
      prisma.unit.count({ where: { directorateId } }),
    ]);
    return { units, total };
  },

  async findAll(page: number, limit: number) {
    const skip = getSkipOffset(page, limit);
    const [units, total] = await Promise.all([
      prisma.unit.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          directorate: true,
          _count: { select: { members: true } },
        },
      }),
      prisma.unit.count(),
    ]);
    return { units, total };
  },

  async update(id: string, data: { name?: string }) {
    return prisma.unit.update({
      where: { id },
      data,
      include: { directorate: true },
    });
  },

  async delete(id: string) {
    return prisma.unit.delete({ where: { id } });
  },

  async hasMembers(id: string) {
    const count = await prisma.user.count({ where: { unitId: id } });
    return count > 0;
  },
};
