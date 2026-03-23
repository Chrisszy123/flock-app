import {
  directorateRepository,
  unitRepository,
  userRepository,
} from '../repositories';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
  getPaginationMeta,
  toUserDTO,
} from '../utils';
import { Role } from '../types';

export const workforceService = {
  // ─── DIRECTORATE MANAGEMENT ───────────────────────────────────────────

  async createDirectorate(name: string, description?: string) {
    const existing = await directorateRepository.findByName(name);
    if (existing) {
      throw new ConflictError('A directorate with this name already exists');
    }
    return directorateRepository.create({ name, description });
  },

  async getDirectorate(id: string) {
    const directorate = await directorateRepository.findById(id);
    if (!directorate) throw new NotFoundError('Directorate not found');
    return directorate;
  },

  async getDirectorates(page: number, limit: number) {
    const { directorates, total } = await directorateRepository.findAll(page, limit);
    return {
      data: directorates,
      pagination: getPaginationMeta(page, limit, total),
    };
  },

  async updateDirectorate(id: string, data: { name?: string; description?: string | null }) {
    await this.getDirectorate(id);

    if (data.name) {
      const existing = await directorateRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new ConflictError('A directorate with this name already exists');
      }
    }

    return directorateRepository.update(id, data);
  },

  async deleteDirectorate(id: string) {
    const hasMembers = await directorateRepository.hasMembersOrUnits(id);
    if (hasMembers) {
      throw new BadRequestError(
        'Cannot delete directorate that has workers or units. Reassign them first.'
      );
    }
    return directorateRepository.delete(id);
  },

  // ─── UNIT MANAGEMENT ─────────────────────────────────────────────────

  async createUnit(name: string, directorateId: string) {
    const directorate = await directorateRepository.findById(directorateId);
    if (!directorate) throw new NotFoundError('Directorate not found');
    return unitRepository.create({ name, directorateId });
  },

  async getUnit(id: string) {
    const unit = await unitRepository.findById(id);
    if (!unit) throw new NotFoundError('Unit not found');
    return unit;
  },

  async getUnits(page: number, limit: number, directorateId?: string) {
    if (directorateId) {
      const { units, total } = await unitRepository.findByDirectorate(directorateId, page, limit);
      return { data: units, pagination: getPaginationMeta(page, limit, total) };
    }
    const { units, total } = await unitRepository.findAll(page, limit);
    return { data: units, pagination: getPaginationMeta(page, limit, total) };
  },

  async updateUnit(id: string, data: { name?: string }) {
    await this.getUnit(id);
    return unitRepository.update(id, data);
  },

  async deleteUnit(id: string) {
    const hasMembers = await unitRepository.hasMembers(id);
    if (hasMembers) {
      throw new BadRequestError(
        'Cannot delete unit that has workers. Reassign them first.'
      );
    }
    return unitRepository.delete(id);
  },

  // ─── WORKER ASSIGNMENT ───────────────────────────────────────────────

  async assignWorkerToDirectorate(userId: string, directorateId: string | null) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (directorateId) {
      const directorate = await directorateRepository.findById(directorateId);
      if (!directorate) throw new NotFoundError('Directorate not found');

      // Cannot assign to multiple directorates
      if (user.directorateId && user.directorateId !== directorateId) {
        throw new BadRequestError(
          'Worker is already assigned to a directorate. Remove them first.'
        );
      }
    }

    return userRepository.assignToDirectorate(userId, directorateId);
  },

  async assignWorkerToUnit(userId: string, unitId: string | null) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (unitId) {
      const unit = await unitRepository.findById(unitId);
      if (!unit) throw new NotFoundError('Unit not found');

      // Unit must belong to the user's directorate
      if (user.directorateId && unit.directorateId !== user.directorateId) {
        throw new BadRequestError(
          'Unit does not belong to the worker\'s directorate'
        );
      }
    }

    return userRepository.assignToUnit(userId, unitId);
  },

  // ─── SCOPED WORKER LISTING ───────────────────────────────────────────

  async getWorkersForDirectorate(directorateId: string, page: number, limit: number) {
    const { workers, total } = await userRepository.getWorkersByDirectorate(
      directorateId,
      page,
      limit
    );
    return {
      data: workers.map(toUserDTO),
      pagination: getPaginationMeta(page, limit, total),
    };
  },

  async getWorkersForUnit(unitId: string, page: number, limit: number) {
    const { workers, total } = await userRepository.getWorkersByUnit(unitId, page, limit);
    return {
      data: workers.map(toUserDTO),
      pagination: getPaginationMeta(page, limit, total),
    };
  },

  // ─── SUSPENSION ───────────────────────────────────────────────────────

  async suspendWorker(
    targetUserId: string,
    isSuspended: boolean,
    suspensionReason: string | null,
    requestingUser: { userId: string; role: Role; directorateId?: string | null }
  ) {
    const target = await userRepository.findById(targetUserId);
    if (!target) throw new NotFoundError('User not found');

    // Cannot suspend admin without higher privilege
    if (target.role === 'ADMIN' && requestingUser.role !== 'ADMIN') {
      throw new ForbiddenError('Cannot suspend an admin without admin privilege');
    }

    // Cannot suspend yourself
    if (target.id === requestingUser.userId) {
      throw new BadRequestError('Cannot suspend yourself');
    }

    // DIRECTORATE can only suspend workers in their directorate
    if (requestingUser.role === 'DIRECTORATE') {
      if (target.directorateId !== requestingUser.directorateId) {
        throw new ForbiddenError('Can only suspend workers in your directorate');
      }
    }

    return userRepository.suspend(targetUserId, isSuspended, suspensionReason);
  },

  // ─── WORKER PROFILE CREATION (by Leader/Directorate/Admin) ────────────

  async createWorkerProfile(data: {
    email: string;
    password: string;
    fullName: string;
    role: Role;
    directorateId?: string;
    unitId?: string;
    phone?: string;
    occupation?: string;
  }) {
    // Validate role — only WORKER, LEADER, DIRECTORATE can be created this way
    if (!['WORKER', 'LEADER', 'DIRECTORATE'].includes(data.role)) {
      throw new BadRequestError('Can only create WORKER, LEADER, or DIRECTORATE profiles');
    }

    const { hashPassword } = await import('../utils/password');
    const passwordHash = await hashPassword(data.password);

    return userRepository.create({
      email: data.email.toLowerCase(),
      passwordHash,
      fullName: data.fullName,
      role: data.role,
      directorateId: data.directorateId,
      unitId: data.unitId,
      phone: data.phone,
      occupation: data.occupation,
    });
  },
};
