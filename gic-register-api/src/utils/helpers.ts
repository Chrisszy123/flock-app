import { User } from '@prisma/client';
import { UserDTO } from '../types';

/**
 * Converts a Prisma User to a safe DTO (excludes sensitive fields like passwordHash)
 */
export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    adminSubRole: user.adminSubRole,
    workerStatus: user.workerStatus,
    dateOfBirth: user.dateOfBirth,
    phone: user.phone,
    address: user.address,
    photoUrl: user.photoUrl,
    occupation: user.occupation,
    primaryServiceUnit: user.primaryServiceUnit,
    secondaryServiceUnit: user.secondaryServiceUnit,
    unitId: user.unitId,
    directorateId: user.directorateId,
    isSuspended: user.isSuspended,
    suspensionReason: user.suspensionReason,
    marketingOptInEmail: user.marketingOptInEmail,
    marketingOptInSMS: user.marketingOptInSMS,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Gets the start of the current day in UTC
 */
export function getStartOfDayUTC(date: Date = new Date()): Date {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  return startOfDay;
}

/**
 * Gets the end of the current day in UTC
 */
export function getEndOfDayUTC(date: Date = new Date()): Date {
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);
  return endOfDay;
}

/**
 * Generates pagination metadata
 */
export function getPaginationMeta(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Calculates skip offset for pagination
 */
export function getSkipOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
