import { prisma } from '../config/database';
import { Role, AdminSubRole, WorkerStatus } from '@prisma/client';
import { getSkipOffset } from '../utils';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  fullName: string;
  role?: Role;
  adminSubRole?: AdminSubRole;
  dateOfBirth?: Date;
  phone?: string;
  address?: string;
  occupation?: string;
  directorateId?: string;
  unitId?: string;
}

export interface UpdateUserData {
  fullName?: string;
  dateOfBirth?: Date | null;
  phone?: string | null;
  address?: string | null;
  photoUrl?: string | null;
  occupation?: string | null;
  primaryServiceUnit?: string | null;
  secondaryServiceUnit?: string | null;
  marketingOptInEmail?: boolean;
  marketingOptInSMS?: boolean;
}

export interface UserSearchParams {
  search?: string;
  role?: Role;
  page: number;
  limit: number;
}

export const userRepository = {
  async create(data: CreateUserData) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        role: data.role || 'MEMBER',
        adminSubRole: data.adminSubRole,
        dateOfBirth: data.dateOfBirth,
        phone: data.phone,
        address: data.address,
        occupation: data.occupation,
        directorateId: data.directorateId,
        unitId: data.unitId,
      },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        unit: true,
        directorate: true,
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  },

  async update(id: string, data: UpdateUserData) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async updateRole(id: string, role: Role, adminSubRole?: AdminSubRole | null) {
    return prisma.user.update({
      where: { id },
      data: {
        role,
        adminSubRole: adminSubRole ?? null,
        // Set worker status based on role
        workerStatus: role === 'MEMBER' ? 'NONE' : 'ACTIVE',
      },
    });
  },

  async updateWorkerStatus(id: string, workerStatus: WorkerStatus) {
    return prisma.user.update({
      where: { id },
      data: { workerStatus },
    });
  },

  async suspend(id: string, isSuspended: boolean, suspensionReason?: string | null) {
    return prisma.user.update({
      where: { id },
      data: {
        isSuspended,
        suspensionReason: isSuspended ? suspensionReason : null,
        workerStatus: isSuspended ? 'SUSPENDED' : 'ACTIVE',
      },
    });
  },

  async assignToDirectorate(userId: string, directorateId: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        directorateId,
        // Clear unit if removing directorate
        ...(directorateId === null ? { unitId: null } : {}),
      },
    });
  },

  async assignToUnit(userId: string, unitId: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: { unitId },
    });
  },

  async search(params: UserSearchParams) {
    const { search, role, page, limit } = params;
    const skip = getSkipOffset(page, limit);

    const where = {
      AND: [
        search
          ? {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {},
        role ? { role } : {},
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          unit: true,
          directorate: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  },

  async getWorkers(page: number, limit: number, directorateId?: string, unitId?: string) {
    const skip = getSkipOffset(page, limit);
    const where = {
      role: { in: ['WORKER', 'LEADER', 'DIRECTORATE'] as Role[] },
      ...(directorateId ? { directorateId } : {}),
      ...(unitId ? { unitId } : {}),
    };

    const [workers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          trainingProgress: {
            include: {
              trainingModule: true,
            },
          },
          unit: true,
          directorate: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { workers, total };
  },

  async getWorkersByDirectorate(directorateId: string, page: number, limit: number) {
    const skip = getSkipOffset(page, limit);
    const where = {
      directorateId,
      role: { in: ['WORKER', 'LEADER', 'DIRECTORATE'] as Role[] },
    };

    const [workers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { unit: true, directorate: true },
      }),
      prisma.user.count({ where }),
    ]);

    return { workers, total };
  },

  async getWorkersByUnit(unitId: string, page: number, limit: number) {
    const skip = getSkipOffset(page, limit);
    const where = {
      unitId,
      role: { in: ['WORKER', 'LEADER'] as Role[] },
    };

    const [workers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { unit: true, directorate: true },
      }),
      prisma.user.count({ where }),
    ]);

    return { workers, total };
  },

  async countByDirectorate(directorateId: string) {
    return prisma.user.count({ where: { directorateId } });
  },

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  },
};
