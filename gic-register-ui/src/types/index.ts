// ─── ENUMS ─────────────────────────────────────────────────────────────────────

export type Role = 'MEMBER' | 'WORKER' | 'LEADER' | 'DIRECTORATE' | 'ADMIN';
export type AdminSubRole = 'LEAD_PASTOR' | 'ADMIN_PASTOR' | 'SECRETARY';
export type WorkerStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'NONE';
export type CheckInType = 'WORKER' | 'MEMBER';
export type PermissionStatus = 'PENDING' | 'APPROVED' | 'DECLINED';
export type PaymentMethod = 'BANK' | 'CRYPTO';
export type PaymentStatus = 'PENDING' | 'CONFIRMED';
export type NewsVisibility = 'PUBLIC' | 'WORKERS_ONLY';
export type ResourceType = 'MESSAGE' | 'BOOK';

// ─── USER ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  adminSubRole: AdminSubRole | null;
  workerStatus: WorkerStatus;
  dateOfBirth: string | null;
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
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── API RESPONSE ──────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: { field: string; message: string }[];
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

// ─── ATTENDANCE ────────────────────────────────────────────────────────────────

export interface Attendance {
  id: string;
  userId: string;
  eventId: string | null;
  date: string;
  checkInTime: string;
  checkInType: CheckInType;
  latitude: number;
  longitude: number;
  user?: Partial<User>;
  event?: Event | null;
}

export interface CheckInResult extends Attendance {
  geofence: {
    distance: number;
    allowedRadius: number;
    withinRadius: boolean;
  };
}

export interface CanCheckInResult {
  canCheckIn: boolean;
  reason?: string;
  distance?: number;
  allowedRadius?: number;
  alreadyCheckedIn?: boolean;
}

// ─── EVENT ─────────────────────────────────────────────────────────────────────

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  startTime: string;
  endTime: string;
  locationName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  coverImageUrl: string | null;
  allowSharing: boolean;
  galleryImages: string[] | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: Partial<User>;
  _count?: {
    attendances: number;
  };
}

// ─── TRAINING ──────────────────────────────────────────────────────────────────

export interface TrainingModule {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isMandatory: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingProgress {
  id: string;
  userId: string;
  trainingModuleId: string;
  completed: boolean;
  completedAt: string | null;
  trainingModule: TrainingModule;
}

export interface TrainingDashboard {
  totalModules: number;
  completedModules: number;
  progressPercentage: number;
  modules: TrainingProgress[];
}

// ─── CHURCH LOCATION ───────────────────────────────────────────────────────────

export interface ChurchLocation {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isDefault: boolean;
}

// ─── DIRECTORATE & UNIT ────────────────────────────────────────────────────────

export interface Directorate {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { members: number; units: number };
}

export interface Unit {
  id: string;
  name: string;
  directorateId: string;
  createdAt: string;
  updatedAt: string;
  directorate?: Directorate;
  _count?: { members: number };
}

// ─── PERMISSION REQUEST ────────────────────────────────────────────────────────

export interface PermissionRequest {
  id: string;
  userId: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: PermissionStatus;
  decisionReason: string | null;
  approvedById: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Partial<User>;
  approvedBy?: Partial<User> | null;
}

// ─── TITHE & OFFERING ──────────────────────────────────────────────────────────

export interface TitheOffering {
  id: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  transactionReference: string | null;
  cryptoWalletAddress: string | null;
  proofImageUrl: string | null;
  status: PaymentStatus;
  confirmedById: string | null;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Partial<User>;
}

export interface TitheStats {
  totalConfirmedAmount: number;
  totalRecords: number;
  confirmedCount: number;
  pendingCount: number;
}

// ─── NEWS POST ─────────────────────────────────────────────────────────────────

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  visibility: NewsVisibility;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: Partial<User>;
}

// ─── RESOURCE ──────────────────────────────────────────────────────────────────

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  description: string | null;
  fileUrl: string | null;
  price: number | null;
  excerpt: string | null;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── ADMIN NOTIFICATION ────────────────────────────────────────────────────────

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  targetRole: Role | null;
  createdById: string;
  createdAt: string;
  createdBy?: Partial<User>;
}

// ─── WORKER WITH TRAINING ──────────────────────────────────────────────────────

export interface WorkerWithProgress extends User {
  trainingProgress: {
    total: number;
    completed: number;
    percentage: number;
  };
}

// ─── FORM INPUT TYPES ──────────────────────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  dateOfBirth?: string;
  phone?: string | null;
  address?: string | null;
  photoUrl?: string | null;
  occupation?: string | null;
  primaryServiceUnit?: string | null;
  secondaryServiceUnit?: string | null;
  marketingOptInEmail?: boolean;
  marketingOptInSMS?: boolean;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  locationName: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  coverImageUrl?: string;
  allowSharing?: boolean;
  galleryImages?: string[];
}

export interface CreateTrainingModuleInput {
  title: string;
  description?: string;
  order?: number;
  isMandatory?: boolean;
}

// ─── GEOLOCATION ───────────────────────────────────────────────────────────────

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationState {
  coordinates: Coordinates | null;
  error: string | null;
  isLoading: boolean;
}
