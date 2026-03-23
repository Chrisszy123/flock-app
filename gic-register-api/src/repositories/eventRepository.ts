import { prisma } from '../config/database';
import { getSkipOffset } from '../utils';

export interface CreateEventData {
  title: string;
  description?: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  locationName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  createdById: string;
}

export interface UpdateEventData {
  title?: string;
  description?: string | null;
  date?: Date;
  startTime?: Date;
  endTime?: Date;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
}

export const eventRepository = {
  /**
   * Creates a new event
   */
  async create(data: CreateEventData) {
    return prisma.event.create({
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Finds an event by ID
   */
  async findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Updates an event
   */
  async update(id: string, data: UpdateEventData) {
    return prisma.event.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Deletes an event
   */
  async delete(id: string) {
    return prisma.event.delete({
      where: { id },
    });
  },

  /**
   * Gets all events with pagination
   */
  async findMany(page: number, limit: number) {
    const skip = getSkipOffset(page, limit);

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          _count: {
            select: { attendances: true },
          },
        },
      }),
      prisma.event.count(),
    ]);

    return { events, total };
  },

  /**
   * Gets upcoming events
   */
  async getUpcoming(limit: number = 10) {
    const now = new Date();

    return prisma.event.findMany({
      where: {
        date: { gte: now },
      },
      take: limit,
      orderBy: { date: 'asc' },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  },

  /**
   * Gets events by date range
   */
  async findByDateRange(startDate: Date, endDate: Date) {
    return prisma.event.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  },

  /**
   * Gets event with full attendance details
   */
  async getWithAttendance(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        attendances: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { checkInTime: 'asc' },
        },
      },
    });
  },
};
