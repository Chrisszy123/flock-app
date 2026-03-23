import { prisma } from '../config/database';
import { getSkipOffset, getStartOfDayUTC } from '../utils';

export interface AttendanceQueryParams {
  userId?: string;
  eventId?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
}

export const attendanceRepository = {
  /**
   * Creates an attendance record
   */
  async create(data: {
    userId: string;
    eventId?: string;
    latitude: number;
    longitude: number;
    date?: Date;
  }) {
    const date = data.date || getStartOfDayUTC();
    
    return prisma.attendance.create({
      data: {
        userId: data.userId,
        eventId: data.eventId || null,
        latitude: data.latitude,
        longitude: data.longitude,
        date,
        checkInTime: new Date(),
      },
      include: {
        event: true,
      },
    });
  },

  /**
   * Checks if user has already checked in today for an event
   */
  async hasCheckedInToday(userId: string, eventId?: string) {
    const today = getStartOfDayUTC();

    const existing = await prisma.attendance.findFirst({
      where: {
        userId,
        eventId: eventId || null,
        date: today,
      },
    });

    return !!existing;
  },

  /**
   * Gets attendance records with pagination
   */
  async findMany(params: AttendanceQueryParams) {
    const { userId, eventId, startDate, endDate, page, limit } = params;
    const skip = getSkipOffset(page, limit);

    const where = {
      AND: [
        userId ? { userId } : {},
        eventId ? { eventId } : {},
        startDate ? { date: { gte: startDate } } : {},
        endDate ? { date: { lte: endDate } } : {},
      ],
    };

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { checkInTime: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
          event: true,
        },
      }),
      prisma.attendance.count({ where }),
    ]);

    return { records, total };
  },

  /**
   * Gets attendance history for a specific user
   */
  async getUserHistory(userId: string, page: number, limit: number) {
    const skip = getSkipOffset(page, limit);

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { checkInTime: 'desc' },
        include: { event: true },
      }),
      prisma.attendance.count({ where: { userId } }),
    ]);

    return { records, total };
  },

  /**
   * Gets attendance statistics for an event
   */
  async getEventStats(eventId: string) {
    const [total, byRole] = await Promise.all([
      prisma.attendance.count({ where: { eventId } }),
      prisma.attendance.groupBy({
        by: ['userId'],
        where: { eventId },
        _count: { userId: true },
      }),
    ]);

    return { total, uniqueAttendees: byRole.length };
  },

  /**
   * Gets recent check-ins (last N records)
   */
  async getRecent(limit: number = 10) {
    return prisma.attendance.findMany({
      take: limit,
      orderBy: { checkInTime: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  },

  /**
   * Gets user's last check-in
   */
  async getLastCheckIn(userId: string) {
    return prisma.attendance.findFirst({
      where: { userId },
      orderBy: { checkInTime: 'desc' },
      include: { event: true },
    });
  },
};
