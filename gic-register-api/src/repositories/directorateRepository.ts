import { prisma } from '../config/database';
import { getSkipOffset } from '../utils';

export const directorateRepository = {
  async create(data: { name: string; description?: string }) {
    return prisma.directorate.create({ data });
  },

  async findById(id: string) {
    return prisma.directorate.findUnique({
      where: { id },
      include: {
        units: true,
        _count: { select: { members: true, units: true } },
      },
    });
  },

  async findByName(name: string) {
    return prisma.directorate.findUnique({ where: { name } });
  },

  async findAll(page: number, limit: number) {
    const skip = getSkipOffset(page, limit);
    const [directorates, total] = await Promise.all([
      prisma.directorate.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { members: true, units: true } },
        },
      }),
      prisma.directorate.count(),
    ]);
    return { directorates, total };
  },

  async update(id: string, data: { name?: string; description?: string | null }) {
    return prisma.directorate.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.directorate.delete({ where: { id } });
  },

  async hasMembersOrUnits(id: string) {
    const counts = await prisma.directorate.findUnique({
      where: { id },
      include: { _count: { select: { members: true, units: true } } },
    });
    return (counts?._count.members ?? 0) > 0 || (counts?._count.units ?? 0) > 0;
  },
};
