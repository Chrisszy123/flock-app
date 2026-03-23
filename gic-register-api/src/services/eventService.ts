import { eventRepository } from '../repositories';
import { NotFoundError, getPaginationMeta } from '../utils';
import { CreateEventInput, UpdateEventInput } from '../validators';
import { PaginatedResponse, EventDTO } from '../types';

export const eventService = {
  /**
   * Creates a new church event
   */
  async createEvent(input: CreateEventInput, createdById: string): Promise<EventDTO> {
    const event = await eventRepository.create({
      ...input,
      radiusMeters: input.radiusMeters || 100,
      createdById,
    });

    return event as unknown as EventDTO;
  },

  /**
   * Gets an event by ID
   */
  async getEventById(id: string): Promise<EventDTO> {
    const event = await eventRepository.findById(id);
    if (!event) {
      throw new NotFoundError('Event not found');
    }
    return event as unknown as EventDTO;
  },

  /**
   * Updates an event
   */
  async updateEvent(id: string, input: UpdateEventInput): Promise<EventDTO> {
    const event = await eventRepository.findById(id);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const updatedEvent = await eventRepository.update(id, input);
    return updatedEvent as unknown as EventDTO;
  },

  /**
   * Deletes an event
   */
  async deleteEvent(id: string): Promise<void> {
    const event = await eventRepository.findById(id);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    await eventRepository.delete(id);
  },

  /**
   * Gets all events with pagination
   */
  async getEvents(page: number, limit: number): Promise<PaginatedResponse<EventDTO>> {
    const { events, total } = await eventRepository.findMany(page, limit);

    return {
      data: events as unknown as EventDTO[],
      pagination: getPaginationMeta(page, limit, total),
    };
  },

  /**
   * Gets upcoming events
   */
  async getUpcomingEvents(limit: number = 10) {
    return eventRepository.getUpcoming(limit);
  },

  /**
   * Gets event with full attendance list
   */
  async getEventWithAttendance(id: string) {
    const event = await eventRepository.getWithAttendance(id);
    if (!event) {
      throw new NotFoundError('Event not found');
    }
    return event;
  },

  /**
   * Gets events within a date range
   */
  async getEventsByDateRange(startDate: Date, endDate: Date) {
    return eventRepository.findByDateRange(startDate, endDate);
  },
};
