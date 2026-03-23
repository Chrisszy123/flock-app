import { config } from '../config';
import {
  attendanceRepository,
  eventRepository,
  churchLocationRepository,
} from '../repositories';
import {
  checkGeofence,
  GeofenceError,
  DuplicateCheckInError,
  NotFoundError,
  getPaginationMeta,
} from '../utils';
import { CheckInInput, AttendanceQueryParams } from '../validators';
import { Coordinates, PaginatedResponse } from '../types';

export const attendanceService = {
  /**
   * Checks in a user at the church or an event
   * This is the CRITICAL geofence-enforced check-in logic
   */
  async checkIn(userId: string, input: CheckInInput) {
    const userLocation: Coordinates = {
      latitude: input.latitude,
      longitude: input.longitude,
    };

    // Determine target location (event or default church)
    let targetLocation: Coordinates;
    let allowedRadius: number;
    let eventName: string | undefined;

    if (input.eventId) {
      // Check-in for specific event
      const event = await eventRepository.findById(input.eventId);
      if (!event) {
        throw new NotFoundError('Event not found');
      }

      targetLocation = {
        latitude: event.latitude,
        longitude: event.longitude,
      };
      allowedRadius = event.radiusMeters;
      eventName = event.title;
    } else {
      // Regular service check-in - use default church location
      const defaultLocation = await churchLocationRepository.getDefault();
      
      if (defaultLocation) {
        targetLocation = {
          latitude: defaultLocation.latitude,
          longitude: defaultLocation.longitude,
        };
        allowedRadius = defaultLocation.radiusMeters;
      } else {
        // Fallback to config default
        targetLocation = {
          latitude: config.defaultChurch.latitude,
          longitude: config.defaultChurch.longitude,
        };
        allowedRadius = config.defaultChurch.radiusMeters;
      }
    }

    // CRITICAL: Server-side geofence verification
    const geofenceResult = checkGeofence(userLocation, targetLocation, allowedRadius);

    if (!geofenceResult.isWithinRadius) {
      throw new GeofenceError(geofenceResult.distance, geofenceResult.allowedRadius);
    }

    // Check for duplicate check-in
    const hasCheckedIn = await attendanceRepository.hasCheckedInToday(
      userId,
      input.eventId
    );

    if (hasCheckedIn) {
      throw new DuplicateCheckInError(eventName);
    }

    // Create attendance record
    const attendance = await attendanceRepository.create({
      userId,
      eventId: input.eventId,
      latitude: input.latitude,
      longitude: input.longitude,
    });

    return {
      ...attendance,
      geofence: {
        distance: geofenceResult.distance,
        allowedRadius: geofenceResult.allowedRadius,
        withinRadius: true,
      },
    };
  },

  /**
   * Gets user's attendance history
   */
  async getUserAttendance(
    userId: string,
    page: number,
    limit: number
  ) {
    const { records, total } = await attendanceRepository.getUserHistory(
      userId,
      page,
      limit
    );

    return {
      data: records,
      pagination: getPaginationMeta(page, limit, total),
    };
  },

  /**
   * Gets attendance records with filters
   */
  async getAttendance(
    params: AttendanceQueryParams
  ): Promise<PaginatedResponse<any>> {
    const { records, total } = await attendanceRepository.findMany(params);

    return {
      data: records,
      pagination: getPaginationMeta(params.page, params.limit, total),
    };
  },

  /**
   * Gets attendance for a specific event
   */
  async getEventAttendance(eventId: string, page: number, limit: number) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const { records, total } = await attendanceRepository.findMany({
      eventId,
      page,
      limit,
    });

    return {
      event,
      attendance: {
        data: records,
        pagination: getPaginationMeta(page, limit, total),
      },
    };
  },

  /**
   * Gets recent check-ins
   */
  async getRecentCheckIns(limit: number = 10) {
    return attendanceRepository.getRecent(limit);
  },

  /**
   * Gets user's last check-in
   */
  async getLastCheckIn(userId: string) {
    return attendanceRepository.getLastCheckIn(userId);
  },

  /**
   * Checks if user can check in (for UI state)
   * This is a convenience method - the actual enforcement happens in checkIn()
   */
  async canCheckIn(
    userId: string,
    latitude: number,
    longitude: number,
    eventId?: string
  ) {
    const userLocation: Coordinates = { latitude, longitude };

    // Determine target location
    let targetLocation: Coordinates;
    let allowedRadius: number;

    if (eventId) {
      const event = await eventRepository.findById(eventId);
      if (!event) {
        return { canCheckIn: false, reason: 'Event not found' };
      }
      targetLocation = { latitude: event.latitude, longitude: event.longitude };
      allowedRadius = event.radiusMeters;
    } else {
      const defaultLocation = await churchLocationRepository.getDefault();
      if (defaultLocation) {
        targetLocation = {
          latitude: defaultLocation.latitude,
          longitude: defaultLocation.longitude,
        };
        allowedRadius = defaultLocation.radiusMeters;
      } else {
        targetLocation = {
          latitude: config.defaultChurch.latitude,
          longitude: config.defaultChurch.longitude,
        };
        allowedRadius = config.defaultChurch.radiusMeters;
      }
    }

    // Check geofence
    const geofenceResult = checkGeofence(userLocation, targetLocation, allowedRadius);

    if (!geofenceResult.isWithinRadius) {
      return {
        canCheckIn: false,
        reason: `You are ${geofenceResult.distance}m away. Must be within ${allowedRadius}m.`,
        distance: geofenceResult.distance,
        allowedRadius,
      };
    }

    // Check duplicate
    const hasCheckedIn = await attendanceRepository.hasCheckedInToday(userId, eventId);
    if (hasCheckedIn) {
      return {
        canCheckIn: false,
        reason: 'Already checked in today',
        alreadyCheckedIn: true,
      };
    }

    return {
      canCheckIn: true,
      distance: geofenceResult.distance,
      allowedRadius,
    };
  },
};
