import { z } from 'zod';

// ─── COMMON VALIDATORS ────────────────────────────────────────────────────────

const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
const uuidSchema = z.string().uuid('Invalid ID format');
const latitudeSchema = z.number().min(-90).max(90);
const longitudeSchema = z.number().min(-180).max(180);

// ─── ENUM VALIDATORS ──────────────────────────────────────────────────────────

export const RoleEnum = z.enum(['MEMBER', 'WORKER', 'LEADER', 'DIRECTORATE', 'ADMIN']);
export const AdminSubRoleEnum = z.enum(['LEAD_PASTOR', 'ADMIN_PASTOR', 'SECRETARY']);
export const WorkerStatusEnum = z.enum(['ACTIVE', 'PENDING', 'SUSPENDED', 'NONE']);
export const CheckInTypeEnum = z.enum(['WORKER', 'MEMBER']);
export const PermissionStatusEnum = z.enum(['PENDING', 'APPROVED', 'DECLINED']);
export const PaymentMethodEnum = z.enum(['BANK', 'CRYPTO']);
export const PaymentStatusEnum = z.enum(['PENDING', 'CONFIRMED']);
export const NewsVisibilityEnum = z.enum(['PUBLIC', 'WORKERS_ONLY']);
export const ResourceTypeEnum = z.enum(['MESSAGE', 'BOOK']);

// ─── AUTH VALIDATORS ──────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .optional()
    .transform((val) => (val ? new Date(`${val}T00:00:00Z`) : undefined))
    .refine(
      (date) => {
        if (!date) return true;
        const today = new Date();
        const minDate = new Date(
          today.getFullYear() - 15,
          today.getMonth(),
          today.getDate()
        );
        return date <= minDate;
      },
      { message: 'You must be at least 15 years old' }
    ),
  phone: z.string().min(10).max(20).optional(),
  address: z.string().max(500).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── USER VALIDATORS ──────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  dateOfBirth: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  phone: z.string().min(10).max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  occupation: z.string().max(200).optional().nullable(),
  primaryServiceUnit: z.string().max(100).optional().nullable(),
  secondaryServiceUnit: z.string().max(100).optional().nullable(),
  marketingOptInEmail: z.boolean().optional(),
  marketingOptInSMS: z.boolean().optional(),
});

export const updateUserRoleSchema = z.object({
  role: RoleEnum,
  adminSubRole: AdminSubRoleEnum.optional().nullable(),
});

export const updateWorkerStatusSchema = z.object({
  workerStatus: WorkerStatusEnum,
});

export const assignWorkerSchema = z.object({
  directorateId: uuidSchema.optional().nullable(),
  unitId: uuidSchema.optional().nullable(),
});

export const suspendUserSchema = z.object({
  isSuspended: z.boolean(),
  suspensionReason: z.string().max(500).optional().nullable(),
});

// ─── ATTENDANCE VALIDATORS ────────────────────────────────────────────────────

export const checkInSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  eventId: uuidSchema.optional(),
  checkInType: CheckInTypeEnum.optional().default('WORKER'),
});

// ─── EVENT VALIDATORS ─────────────────────────────────────────────────────────

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).optional(),
  date: z.string().datetime().transform((val) => new Date(val)),
  startTime: z.string().datetime().transform((val) => new Date(val)),
  endTime: z.string().datetime().transform((val) => new Date(val)),
  locationName: z.string().min(2).max(200),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  radiusMeters: z.number().min(10).max(10000).optional().default(100),
  coverImageUrl: z.string().url().optional().nullable(),
  allowSharing: z.boolean().optional().default(true),
  galleryImages: z.array(z.string().url()).optional().nullable(),
}).refine((data) => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const updateEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  date: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  startTime: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  endTime: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  locationName: z.string().min(2).max(200).optional(),
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
  radiusMeters: z.number().min(10).max(10000).optional(),
  coverImageUrl: z.string().url().optional().nullable(),
  allowSharing: z.boolean().optional(),
  galleryImages: z.array(z.string().url()).optional().nullable(),
});

// ─── TRAINING VALIDATORS ──────────────────────────────────────────────────────

export const createTrainingModuleSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  order: z.number().int().min(0).optional().default(0),
  isMandatory: z.boolean().optional().default(false),
});

export const updateTrainingModuleSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  order: z.number().int().min(0).optional(),
  isMandatory: z.boolean().optional(),
});

export const updateTrainingProgressSchema = z.object({
  completed: z.boolean(),
});

// ─── DIRECTORATE VALIDATORS ───────────────────────────────────────────────────

export const createDirectorateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  description: z.string().max(1000).optional(),
});

export const updateDirectorateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
});

// ─── UNIT VALIDATORS ──────────────────────────────────────────────────────────

export const createUnitSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  directorateId: uuidSchema,
});

export const updateUnitSchema = z.object({
  name: z.string().min(2).max(200).optional(),
});

// ─── PERMISSION REQUEST VALIDATORS ────────────────────────────────────────────

export const createPermissionRequestSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .transform((val) => new Date(`${val}T00:00:00Z`)),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .transform((val) => new Date(`${val}T00:00:00Z`)),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

export const decidePermissionRequestSchema = z.object({
  status: z.enum(['APPROVED', 'DECLINED']),
  decisionReason: z.string().min(5, 'Decision reason must be at least 5 characters').max(500),
});

// ─── TITHE & OFFERING VALIDATORS ──────────────────────────────────────────────

export const createTitheOfferingSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  method: PaymentMethodEnum,
  transactionReference: z.string().max(200).optional(),
  cryptoWalletAddress: z.string().max(200).optional(),
  proofImageUrl: z.string().url().optional(),
});

export const confirmTitheOfferingSchema = z.object({
  status: z.literal('CONFIRMED'),
});

// ─── NEWS VALIDATORS ──────────────────────────────────────────────────────────

export const createNewsPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(300),
  content: z.string().min(10, 'Content must be at least 10 characters').max(10000),
  visibility: NewsVisibilityEnum.optional().default('PUBLIC'),
});

export const updateNewsPostSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  content: z.string().min(10).max(10000).optional(),
  visibility: NewsVisibilityEnum.optional(),
});

// ─── RESOURCE VALIDATORS ──────────────────────────────────────────────────────

export const createResourceSchema = z.object({
  type: ResourceTypeEnum,
  title: z.string().min(3, 'Title must be at least 3 characters').max(300),
  description: z.string().max(2000).optional(),
  fileUrl: z.string().url().optional(),
  price: z.number().min(0).optional().nullable(),
  excerpt: z.string().max(5000).optional(),
  coverUrl: z.string().url().optional(),
});

export const updateResourceSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  description: z.string().max(2000).optional().nullable(),
  fileUrl: z.string().url().optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  excerpt: z.string().max(5000).optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
});

// ─── ADMIN NOTIFICATION VALIDATORS ────────────────────────────────────────────

export const createNotificationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  message: z.string().min(5, 'Message must be at least 5 characters').max(2000),
  targetRole: RoleEnum.optional().nullable(),
});

// ─── PAGINATION VALIDATORS ────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.string().optional().default('1').transform((val) => Math.max(1, parseInt(val, 10) || 1)),
  limit: z.string().optional().default('20').transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 20))),
});

// ─── QUERY VALIDATORS ─────────────────────────────────────────────────────────

export const memberSearchSchema = z.object({
  search: z.string().optional(),
  role: RoleEnum.optional(),
  page: z.string().optional().default('1').transform((val) => Math.max(1, parseInt(val, 10) || 1)),
  limit: z.string().optional().default('20').transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 20))),
});

export const attendanceQuerySchema = z.object({
  eventId: uuidSchema.optional(),
  checkInType: CheckInTypeEnum.optional(),
  startDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  endDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  page: z.string().optional().default('1').transform((val) => Math.max(1, parseInt(val, 10) || 1)),
  limit: z.string().optional().default('20').transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 20))),
});

export const titheQuerySchema = z.object({
  method: PaymentMethodEnum.optional(),
  status: PaymentStatusEnum.optional(),
  page: z.string().optional().default('1').transform((val) => Math.max(1, parseInt(val, 10) || 1)),
  limit: z.string().optional().default('20').transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 20))),
});

// ─── CHURCH LOCATION VALIDATORS ───────────────────────────────────────────────

export const createChurchLocationSchema = z.object({
  name: z.string().min(2).max(200),
  address: z.string().max(500).optional(),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  radiusMeters: z.number().min(10).max(10000).optional().default(100),
  isDefault: z.boolean().optional().default(false),
});

export const updateChurchLocationSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  address: z.string().max(500).optional().nullable(),
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
  radiusMeters: z.number().min(10).max(10000).optional(),
  isDefault: z.boolean().optional(),
});

// ─── EXPORTED TYPES ───────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateTrainingModuleInput = z.infer<typeof createTrainingModuleSchema>;
export type UpdateTrainingModuleInput = z.infer<typeof updateTrainingModuleSchema>;
export type MemberSearchParams = z.infer<typeof memberSearchSchema>;
export type AttendanceQueryParams = z.infer<typeof attendanceQuerySchema>;
export type CreateDirectorateInput = z.infer<typeof createDirectorateSchema>;
export type UpdateDirectorateInput = z.infer<typeof updateDirectorateSchema>;
export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
export type CreatePermissionRequestInput = z.infer<typeof createPermissionRequestSchema>;
export type DecidePermissionRequestInput = z.infer<typeof decidePermissionRequestSchema>;
export type CreateTitheOfferingInput = z.infer<typeof createTitheOfferingSchema>;
export type CreateNewsPostInput = z.infer<typeof createNewsPostSchema>;
export type UpdateNewsPostInput = z.infer<typeof updateNewsPostSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type TitheQueryParams = z.infer<typeof titheQuerySchema>;
