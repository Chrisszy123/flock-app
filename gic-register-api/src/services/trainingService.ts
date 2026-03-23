import { trainingRepository, userRepository } from '../repositories';
import { NotFoundError, ForbiddenError } from '../utils';
import {
  CreateTrainingModuleInput,
  UpdateTrainingModuleInput,
} from '../validators';
import { WorkerTrainingDashboard, TrainingModuleDTO } from '../types';

export const trainingService = {
  // Training Module Management (Admin/Leader)

  /**
   * Creates a new training module
   */
  async createModule(input: CreateTrainingModuleInput): Promise<TrainingModuleDTO> {
    const module = await trainingRepository.createModule({
      title: input.title,
      description: input.description,
      order: input.order || 0,
      isMandatory: input.isMandatory || false,
    });

    return module as TrainingModuleDTO;
  },

  /**
   * Gets a training module by ID
   */
  async getModuleById(id: string): Promise<TrainingModuleDTO> {
    const module = await trainingRepository.findModuleById(id);
    if (!module) {
      throw new NotFoundError('Training module not found');
    }
    return module as TrainingModuleDTO;
  },

  /**
   * Updates a training module
   */
  async updateModule(
    id: string,
    input: UpdateTrainingModuleInput
  ): Promise<TrainingModuleDTO> {
    const module = await trainingRepository.findModuleById(id);
    if (!module) {
      throw new NotFoundError('Training module not found');
    }

    const updated = await trainingRepository.updateModule(id, input);
    return updated as TrainingModuleDTO;
  },

  /**
   * Deletes a training module
   */
  async deleteModule(id: string): Promise<void> {
    const module = await trainingRepository.findModuleById(id);
    if (!module) {
      throw new NotFoundError('Training module not found');
    }

    await trainingRepository.deleteModule(id);
  },

  /**
   * Gets all training modules
   */
  async getAllModules(): Promise<TrainingModuleDTO[]> {
    const modules = await trainingRepository.getAllModules();
    return modules as TrainingModuleDTO[];
  },

  // Worker Training Progress

  /**
   * Gets worker's training dashboard
   */
  async getWorkerDashboard(userId: string): Promise<WorkerTrainingDashboard> {
    // Verify user is a worker or leader
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role !== 'WORKER' && user.role !== 'LEADER') {
      throw new ForbiddenError('Training dashboard is only available for workers');
    }

    // Get all modules with progress
    const progress = await trainingRepository.getUserProgress(userId);
    const stats = await trainingRepository.getUserCompletionStats(userId);

    return {
      totalModules: stats.total,
      completedModules: stats.completed,
      progressPercentage: stats.percentage,
      modules: progress as any,
    };
  },

  /**
   * Updates training progress for a worker
   */
  async updateProgress(
    userId: string,
    moduleId: string,
    completed: boolean,
    requesterId?: string
  ) {
    // Verify module exists
    const module = await trainingRepository.findModuleById(moduleId);
    if (!module) {
      throw new NotFoundError('Training module not found');
    }

    // If updating own progress, verify user is worker/leader
    if (userId === requesterId) {
      const user = await userRepository.findById(userId);
      if (!user || (user.role !== 'WORKER' && user.role !== 'LEADER')) {
        throw new ForbiddenError('Only workers can update training progress');
      }
    }

    const progress = await trainingRepository.updateProgress(userId, moduleId, completed);
    return progress;
  },

  /**
   * Gets training progress for a specific worker (for leaders/admins)
   */
  async getWorkerProgress(workerId: string): Promise<WorkerTrainingDashboard> {
    const user = await userRepository.findById(workerId);
    if (!user) {
      throw new NotFoundError('Worker not found');
    }

    if (user.role !== 'WORKER' && user.role !== 'LEADER') {
      throw new NotFoundError('User is not a worker');
    }

    const progress = await trainingRepository.getUserProgress(workerId);
    const stats = await trainingRepository.getUserCompletionStats(workerId);

    return {
      totalModules: stats.total,
      completedModules: stats.completed,
      progressPercentage: stats.percentage,
      modules: progress as any,
    };
  },

  /**
   * Checks if worker has completed all mandatory training
   */
  async hasMandatoryCertification(userId: string): Promise<boolean> {
    return trainingRepository.hasCompletedMandatory(userId);
  },
};
