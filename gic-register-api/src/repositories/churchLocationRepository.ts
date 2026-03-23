import { prisma } from '../config/database';

export interface CreateChurchLocationData {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isDefault: boolean;
}

export interface UpdateChurchLocationData {
  name?: string;
  address?: string | null;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  isDefault?: boolean;
}

export const churchLocationRepository = {
  /**
   * Creates a new church location
   */
  async create(data: CreateChurchLocationData) {
    // If this is being set as default, unset other defaults first
    if (data.isDefault) {
      await prisma.churchLocation.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.churchLocation.create({
      data,
    });
  },

  /**
   * Finds a church location by ID
   */
  async findById(id: string) {
    return prisma.churchLocation.findUnique({
      where: { id },
    });
  },

  /**
   * Gets the default church location
   */
  async getDefault() {
    return prisma.churchLocation.findFirst({
      where: { isDefault: true },
    });
  },

  /**
   * Updates a church location
   */
  async update(id: string, data: UpdateChurchLocationData) {
    // If setting as default, unset others first
    if (data.isDefault) {
      await prisma.churchLocation.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return prisma.churchLocation.update({
      where: { id },
      data,
    });
  },

  /**
   * Deletes a church location
   */
  async delete(id: string) {
    return prisma.churchLocation.delete({
      where: { id },
    });
  },

  /**
   * Gets all church locations
   */
  async findAll() {
    return prisma.churchLocation.findMany({
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  },
};
