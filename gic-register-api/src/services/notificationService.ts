import { adminNotificationRepository } from '../repositories';
import { getPaginationMeta } from '../utils';
import { Role } from '../types';

export const notificationService = {
  /**
   * Create and broadcast an admin notification.
   * The WebSocket broadcast is handled at the controller level
   * so the service remains transport-agnostic.
   */
  async createNotification(data: {
    title: string;
    message: string;
    targetRole?: Role | null;
    createdById: string;
  }) {
    return adminNotificationRepository.create(data);
  },

  async getNotifications(page: number, limit: number) {
    const { notifications, total } = await adminNotificationRepository.findAll(
      page,
      limit
    );
    return {
      data: notifications,
      pagination: getPaginationMeta(page, limit, total),
    };
  },

  async getRecentNotifications(limit: number = 10) {
    return adminNotificationRepository.findRecent(limit);
  },
};
