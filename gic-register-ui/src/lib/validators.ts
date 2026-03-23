import { z } from 'zod';

// Auth validators
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  dateOfBirth: z.string().optional(),
  phone: z.string().min(10).max(20).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Profile validators
export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  dateOfBirth: z.string().optional().nullable(),
  phone: z.string().min(10).max(20).optional().nullable().or(z.literal('')),
  address: z.string().max(500).optional().nullable().or(z.literal('')),
  primaryServiceUnit: z.string().max(100).optional().nullable().or(z.literal('')),
  secondaryServiceUnit: z.string().max(100).optional().nullable().or(z.literal('')),
});

// Event validators
export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  locationName: z.string().min(2, 'Location name is required').max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().min(10).max(10000).optional().default(100),
});

// Training module validators
export const createTrainingModuleSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  order: z.number().int().min(0).optional().default(0),
  isMandatory: z.boolean().optional().default(false),
});

// Export types
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type CreateTrainingModuleFormData = z.infer<typeof createTrainingModuleSchema>;
