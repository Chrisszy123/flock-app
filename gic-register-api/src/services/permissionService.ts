import { permissionRequestRepository, userRepository } from '../repositories';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  getPaginationMeta,
} from '../utils';
import { Role, PermissionStatus } from '../types';

export const permissionService = {
  /**
   * Worker submits a permission request
   */
  async submitRequest(userId: string, data: {
    reason: string;
    startDate: Date;
    endDate: Date;
  }) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (user.isSuspended) {
      throw new ForbiddenError('Suspended workers cannot submit permission requests');
    }

    return permissionRequestRepository.create({
      userId,
      ...data,
    });
  },

  /**
   * Get a specific permission request
   */
  async getRequest(id: string) {
    const request = await permissionRequestRepository.findById(id);
    if (!request) throw new NotFoundError('Permission request not found');
    return request;
  },

  /**
   * Get current user's permission requests
   */
  async getMyRequests(userId: string, page: number, limit: number) {
    const { requests, total } = await permissionRequestRepository.findByUser(
      userId,
      page,
      limit
    );
    return {
      data: requests,
      pagination: getPaginationMeta(page, limit, total),
    };
  },

  /**
   * Get pending requests visible to the approving user based on their scope
   */
  async getPendingRequests(
    approver: { role: Role; directorateId?: string | null; unitId?: string | null },
    page: number,
    limit: number
  ) {
    let directorateId: string | undefined;
    let unitId: string | undefined;

    if (approver.role === 'DIRECTORATE' && approver.directorateId) {
      directorateId = approver.directorateId;
    } else if (approver.role === 'LEADER' && approver.unitId) {
      unitId = approver.unitId;
    }
    // ADMIN sees all

    const { requests, total } = await permissionRequestRepository.findPending(
      page,
      limit,
      directorateId,
      unitId
    );
    return {
      data: requests,
      pagination: getPaginationMeta(page, limit, total),
    };
  },

  /**
   * Get all permission requests (admin view)
   */
  async getAllRequests(page: number, limit: number, status?: PermissionStatus) {
    const { requests, total } = await permissionRequestRepository.findAll(
      page,
      limit,
      status
    );
    return {
      data: requests,
      pagination: getPaginationMeta(page, limit, total),
    };
  },

  /**
   * Approve or decline a permission request
   */
  async decideRequest(
    requestId: string,
    decision: { status: 'APPROVED' | 'DECLINED'; decisionReason: string },
    approver: { userId: string; role: Role; directorateId?: string | null; unitId?: string | null }
  ) {
    const request = await permissionRequestRepository.findById(requestId);
    if (!request) throw new NotFoundError('Permission request not found');

    if (request.status !== 'PENDING') {
      throw new BadRequestError('This request has already been decided');
    }

    // Cannot approve own request
    if (request.userId === approver.userId) {
      throw new ForbiddenError('Cannot approve or decline your own permission request');
    }

    // Cannot approve if the requesting user is suspended
    if (request.user?.isSuspended) {
      throw new BadRequestError('Cannot approve a request from a suspended worker');
    }

    // DIRECTORATE can only decide for workers in their directorate
    if (approver.role === 'DIRECTORATE') {
      if (request.user?.directorateId !== approver.directorateId) {
        throw new ForbiddenError('Can only decide requests from workers in your directorate');
      }
    }

    // LEADER can only decide for workers in their unit
    if (approver.role === 'LEADER') {
      if (request.user?.unitId !== approver.unitId) {
        throw new ForbiddenError('Can only decide requests from workers in your unit');
      }
    }

    return permissionRequestRepository.decide(requestId, {
      status: decision.status,
      decisionReason: decision.decisionReason,
      approvedById: approver.userId,
    });
  },
};
