import { Role, WorkerStatus } from '@prisma/client';
import { userRepository } from '../repositories';
import { NotFoundError, toUserDTO, getPaginationMeta, ForbiddenError } from '../utils';
import { UpdateProfileInput, MemberSearchParams } from '../validators';
import { UserDTO, PaginatedResponse } from '../types';

export const userService = {
  /**
   * Gets a user by ID
   */
  async getUserById(id: string): Promise<UserDTO> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return toUserDTO(user);
  },

  /**
   * Updates user profile
   */
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserDTO> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await userRepository.update(userId, {
      fullName: input.fullName,
      dateOfBirth: input.dateOfBirth,
      phone: input.phone,
      address: input.address,
      photoUrl: input.photoUrl,
      primaryServiceUnit: input.primaryServiceUnit,
      secondaryServiceUnit: input.secondaryServiceUnit,
    });

    return toUserDTO(updatedUser);
  },

  /**
   * Updates a user's role (admin only)
   */
  async updateUserRole(
    targetUserId: string,
    newRole: Role,
    requesterId: string
  ): Promise<UserDTO> {
    // Prevent self-demotion
    if (targetUserId === requesterId && newRole !== 'ADMIN') {
      throw new ForbiddenError('Cannot change your own role');
    }

    const user = await userRepository.findById(targetUserId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update worker status based on role
    let workerStatus = user.workerStatus;
    if (newRole === 'WORKER' || newRole === 'LEADER') {
      if (workerStatus === 'NONE') {
        workerStatus = 'PENDING'; // New workers start as pending
      }
    } else if (newRole === 'MEMBER') {
      workerStatus = 'NONE';
    }

    const updatedUser = await userRepository.updateRole(targetUserId, newRole);
    
    if (workerStatus !== user.workerStatus) {
      await userRepository.updateWorkerStatus(targetUserId, workerStatus);
    }

    return toUserDTO(updatedUser);
  },

  /**
   * Updates worker status (leader/admin only)
   */
  async updateWorkerStatus(
    targetUserId: string,
    status: WorkerStatus
  ): Promise<UserDTO> {
    const user = await userRepository.findById(targetUserId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Only workers and leaders can have a worker status
    if (user.role !== 'WORKER' && user.role !== 'LEADER') {
      throw new ForbiddenError('Only workers and leaders can have a worker status');
    }

    const updatedUser = await userRepository.updateWorkerStatus(targetUserId, status);
    return toUserDTO(updatedUser);
  },

  /**
   * Searches members with pagination
   */
  async searchMembers(params: MemberSearchParams): Promise<PaginatedResponse<UserDTO>> {
    const { users, total } = await userRepository.search(params);

    return {
      data: users.map(toUserDTO),
      pagination: getPaginationMeta(params.page, params.limit, total),
    };
  },

  /**
   * Gets workers list with pagination
   */
  async getWorkers(page: number, limit: number) {
    const { workers, total } = await userRepository.getWorkers(page, limit);

    const workersWithProgress = workers.map((worker) => {
      const totalModules = worker.trainingProgress.length;
      const completedModules = worker.trainingProgress.filter((p) => p.completed).length;

      return {
        ...toUserDTO(worker),
        trainingProgress: {
          total: totalModules,
          completed: completedModules,
          percentage: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
        },
      };
    });

    return {
      data: workersWithProgress,
      pagination: getPaginationMeta(page, limit, total),
    };
  },

  /**
   * Gets a worker's detailed profile including training progress
   */
  async getWorkerProfile(workerId: string) {
    const user = await userRepository.findById(workerId);
    if (!user) {
      throw new NotFoundError('Worker not found');
    }

    if (user.role !== 'WORKER' && user.role !== 'LEADER') {
      throw new NotFoundError('User is not a worker');
    }

    return toUserDTO(user);
  },

  /**
   * Deletes a user (admin only)
   */
  async deleteUser(userId: string, requesterId: string): Promise<void> {
    if (userId === requesterId) {
      throw new ForbiddenError('Cannot delete your own account');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await userRepository.delete(userId);
  },
};
