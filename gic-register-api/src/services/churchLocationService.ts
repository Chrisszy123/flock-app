import { churchLocationRepository } from '../repositories';
import { NotFoundError } from '../utils';
import { ChurchLocationDTO } from '../types';

export interface CreateChurchLocationInput {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  isDefault?: boolean;
}

export interface UpdateChurchLocationInput {
  name?: string;
  address?: string | null;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  isDefault?: boolean;
}

export const churchLocationService = {
  /**
   * Creates a new church location
   */
  async createLocation(input: CreateChurchLocationInput): Promise<ChurchLocationDTO> {
    const location = await churchLocationRepository.create({
      name: input.name,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      radiusMeters: input.radiusMeters || 100,
      isDefault: input.isDefault || false,
    });

    return location as ChurchLocationDTO;
  },

  /**
   * Gets a location by ID
   */
  async getLocationById(id: string): Promise<ChurchLocationDTO> {
    const location = await churchLocationRepository.findById(id);
    if (!location) {
      throw new NotFoundError('Church location not found');
    }
    return location as ChurchLocationDTO;
  },

  /**
   * Gets the default church location
   */
  async getDefaultLocation(): Promise<ChurchLocationDTO | null> {
    const location = await churchLocationRepository.getDefault();
    return location as ChurchLocationDTO | null;
  },

  /**
   * Updates a church location
   */
  async updateLocation(
    id: string,
    input: UpdateChurchLocationInput
  ): Promise<ChurchLocationDTO> {
    const location = await churchLocationRepository.findById(id);
    if (!location) {
      throw new NotFoundError('Church location not found');
    }

    const updated = await churchLocationRepository.update(id, input);
    return updated as ChurchLocationDTO;
  },

  /**
   * Deletes a church location
   */
  async deleteLocation(id: string): Promise<void> {
    const location = await churchLocationRepository.findById(id);
    if (!location) {
      throw new NotFoundError('Church location not found');
    }

    await churchLocationRepository.delete(id);
  },

  /**
   * Gets all church locations
   */
  async getAllLocations(): Promise<ChurchLocationDTO[]> {
    const locations = await churchLocationRepository.findAll();
    return locations as ChurchLocationDTO[];
  },
};
