import { prisma } from '../config/database';

export interface CreateTrainingModuleData {
  title: string;
  description?: string;
  order: number;
  isMandatory: boolean;
}

export interface UpdateTrainingModuleData {
  title?: string;
  description?: string | null;
  order?: number;
  isMandatory?: boolean;
}

export const trainingRepository = {
  // Training Module operations

  /**
   * Creates a new training module
   */
  async createModule(data: CreateTrainingModuleData) {
    return prisma.trainingModule.create({
      data,
    });
  },

  /**
   * Finds a training module by ID
   */
  async findModuleById(id: string) {
    return prisma.trainingModule.findUnique({
      where: { id },
    });
  },

  /**
   * Updates a training module
   */
  async updateModule(id: string, data: UpdateTrainingModuleData) {
    return prisma.trainingModule.update({
      where: { id },
      data,
    });
  },

  /**
   * Deletes a training module
   */
  async deleteModule(id: string) {
    return prisma.trainingModule.delete({
      where: { id },
    });
  },

  /**
   * Gets all training modules ordered by sequence
   */
  async getAllModules() {
    return prisma.trainingModule.findMany({
      orderBy: { order: 'asc' },
    });
  },

  /**
   * Gets mandatory modules
   */
  async getMandatoryModules() {
    return prisma.trainingModule.findMany({
      where: { isMandatory: true },
      orderBy: { order: 'asc' },
    });
  },

  // Training Progress operations

  /**
   * Gets or creates training progress for a user
   */
  async getOrCreateProgress(userId: string, trainingModuleId: string) {
    return prisma.workerTrainingProgress.upsert({
      where: {
        userId_trainingModuleId: {
          userId,
          trainingModuleId,
        },
      },
      update: {},
      create: {
        userId,
        trainingModuleId,
        completed: false,
      },
      include: {
        trainingModule: true,
      },
    });
  },

  /**
   * Updates training progress completion status
   */
  async updateProgress(userId: string, trainingModuleId: string, completed: boolean) {
    return prisma.workerTrainingProgress.upsert({
      where: {
        userId_trainingModuleId: {
          userId,
          trainingModuleId,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId,
        trainingModuleId,
        completed,
        completedAt: completed ? new Date() : null,
      },
      include: {
        trainingModule: true,
      },
    });
  },

  /**
   * Gets all progress for a user with module details
   */
  async getUserProgress(userId: string) {
    // First get all modules
    const allModules = await prisma.trainingModule.findMany({
      orderBy: { order: 'asc' },
    });

    // Get user's existing progress
    const existingProgress = await prisma.workerTrainingProgress.findMany({
      where: { userId },
      include: { trainingModule: true },
    });

    // Create a map of existing progress
    const progressMap = new Map(
      existingProgress.map((p) => [p.trainingModuleId, p])
    );

    // Merge modules with progress (include uncompleted ones)
    const mergedProgress = allModules.map((module) => {
      const progress = progressMap.get(module.id);
      return {
        id: progress?.id || '',
        userId,
        trainingModuleId: module.id,
        completed: progress?.completed || false,
        completedAt: progress?.completedAt || null,
        createdAt: progress?.createdAt || new Date(),
        updatedAt: progress?.updatedAt || new Date(),
        trainingModule: module,
      };
    });

    return mergedProgress;
  },

  /**
   * Gets completion stats for a user
   */
  async getUserCompletionStats(userId: string) {
    const [totalModules, completedCount] = await Promise.all([
      prisma.trainingModule.count(),
      prisma.workerTrainingProgress.count({
        where: { userId, completed: true },
      }),
    ]);

    return {
      total: totalModules,
      completed: completedCount,
      percentage: totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0,
    };
  },

  /**
   * Checks if user has completed all mandatory modules
   */
  async hasCompletedMandatory(userId: string) {
    const mandatoryModules = await prisma.trainingModule.findMany({
      where: { isMandatory: true },
      select: { id: true },
    });

    if (mandatoryModules.length === 0) return true;

    const completedMandatory = await prisma.workerTrainingProgress.count({
      where: {
        userId,
        completed: true,
        trainingModuleId: { in: mandatoryModules.map((m) => m.id) },
      },
    });

    return completedMandatory === mandatoryModules.length;
  },
};
