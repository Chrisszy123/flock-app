import { Request } from 'express';
import {
  Role,
  AdminSubRole,
  WorkerStatus,
  CheckInType,
  PermissionStatus,
  PaymentMethod,
  PaymentStatus,
  NewsVisibility,
  ResourceType,
} from '@prisma/client';

// Re-export Prisma enums for convenience
export {
  Role,
  AdminSubRole,
  WorkerStatus,
  CheckInType,
  PermissionStatus,
  PaymentMethod,
  PaymentStatus,
  NewsVisibility,
  ResourceType,
} from '@prisma/client';

// ─── JWT PAYLOAD ───────────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: Role;
  adminSubRole?: AdminSubRole | null;
  directorateId?: string | null;
  unitId?: string | null;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

// ─── REQUEST ───────────────────────────────────────────────────────────────────

export interface AuthenticatedRequest extends Request {
  user?: AccessTokenPayload;
}

// ─── API RESPONSE ──────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// ─── PAGINATION ────────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── USER DTOs ─────────────────────────────────────────────────────────────────

export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  adminSubRole: AdminSubRole | null;
  workerStatus: WorkerStatus;
  dateOfBirth: Date | null;
  phone: string | null;
  address: string | null;
  photoUrl: string | null;
  occupation: string | null;
  primaryServiceUnit: string | null;
  secondaryServiceUnit: string | null;
  unitId: string | null;
  directorateId: string | null;
  isSuspended: boolean;
  suspensionReason: string | null;
  marketingOptInEmail: boolean;
  marketingOptInSMS: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  role?: Role;
  dateOfBirth?: Date;
  phone?: string;
  address?: string;
}

export interface UpdateUserInput {
  fullName?: string;
  dateOfBirth?: Date;
  phone?: string;
  address?: string;
  photoUrl?: string;
  occupation?: string;
  primaryServiceUnit?: string;
  secondaryServiceUnit?: string;
  marketingOptInEmail?: boolean;
  marketingOptInSMS?: boolean;
}

// ─── ATTENDANCE DTOs ───────────────────────────────────────────────────────────

export interface CheckInInput {
  latitude: number;
  longitude: number;
  eventId?: string;
  checkInType?: CheckInType;
}

export interface AttendanceDTO {
  id: string;
  userId: string;
  eventId: string | null;
  date: Date;
  checkInTime: Date;
  checkInType: CheckInType;
  latitude: number;
  longitude: number;
  user?: UserDTO;
  event?: EventDTO | null;
}

// ─── EVENT DTOs ────────────────────────────────────────────────────────────────

export interface EventDTO {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  startTime: Date;
  endTime: Date;
  locationName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  coverImageUrl: string | null;
  allowSharing: boolean;
  galleryImages: unknown;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  locationName: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  coverImageUrl?: string;
  allowSharing?: boolean;
  galleryImages?: unknown;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  date?: Date;
  startTime?: Date;
  endTime?: Date;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  coverImageUrl?: string;
  allowSharing?: boolean;
  galleryImages?: unknown;
}

// ─── TRAINING DTOs ─────────────────────────────────────────────────────────────

export interface TrainingModuleDTO {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isMandatory: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTrainingModuleInput {
  title: string;
  description?: string;
  order?: number;
  isMandatory?: boolean;
}

export interface TrainingProgressDTO {
  id: string;
  userId: string;
  trainingModuleId: string;
  completed: boolean;
  completedAt: Date | null;
  trainingModule?: TrainingModuleDTO;
}

export interface WorkerTrainingDashboard {
  totalModules: number;
  completedModules: number;
  progressPercentage: number;
  modules: (TrainingProgressDTO & { trainingModule: TrainingModuleDTO })[];
}

// ─── DIRECTORATE/UNIT DTOs ─────────────────────────────────────────────────────

export interface DirectorateDTO {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { members: number; units: number };
}

export interface UnitDTO {
  id: string;
  name: string;
  directorateId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { members: number };
}

// ─── PERMISSION REQUEST DTOs ───────────────────────────────────────────────────

export interface PermissionRequestDTO {
  id: string;
  userId: string;
  reason: string;
  startDate: Date;
  endDate: Date;
  status: PermissionStatus;
  decisionReason: string | null;
  approvedById: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: UserDTO;
  approvedBy?: UserDTO | null;
}

// ─── TITHE & OFFERING DTOs ────────────────────────────────────────────────────

export interface TitheOfferingDTO {
  id: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  transactionReference: string | null;
  cryptoWalletAddress: string | null;
  proofImageUrl: string | null;
  status: PaymentStatus;
  confirmedById: string | null;
  confirmedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: UserDTO;
}

// ─── NEWS DTOs ─────────────────────────────────────────────────────────────────

export interface NewsPostDTO {
  id: string;
  title: string;
  content: string;
  visibility: NewsVisibility;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: Partial<UserDTO>;
}

// ─── RESOURCE DTOs ─────────────────────────────────────────────────────────────

export interface ResourceDTO {
  id: string;
  type: ResourceType;
  title: string;
  description: string | null;
  fileUrl: string | null;
  price: number | null;
  excerpt: string | null;
  coverUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── ADMIN NOTIFICATION DTOs ───────────────────────────────────────────────────

export interface AdminNotificationDTO {
  id: string;
  title: string;
  message: string;
  targetRole: Role | null;
  createdById: string;
  createdAt: Date;
  createdBy?: Partial<UserDTO>;
}

// ─── CHURCH LOCATION ───────────────────────────────────────────────────────────

export interface ChurchLocationDTO {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isDefault: boolean;
}

// ─── GEOLOCATION ───────────────────────────────────────────────────────────────

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeofenceResult {
  isWithinRadius: boolean;
  distance: number;
  allowedRadius: number;
}

// ─── AUTH ───────────────────────────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserDTO;
  tokens: AuthTokens;
}
