# GIC Register API

Backend API for the Church Attendance & Workforce Management System.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (access + refresh tokens)
- **Password Hashing**: bcrypt
- **Validation**: Zod

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/gic_register"

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with test data
npm run db:seed
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

### Production

```bash
# Build TypeScript
npm run build

# Run production server
npm start
```

## API Structure

```
src/
├── config/          # Environment configuration
├── controllers/     # Request handlers (thin layer)
├── middleware/      # Auth, validation, error handling
├── repositories/    # Database operations
├── routes/          # API route definitions
├── services/        # Business logic
├── types/           # TypeScript types/interfaces
├── utils/           # Utilities (JWT, password, geolocation)
└── validators/      # Zod validation schemas
```

## Database Schema

### Models
- **User**: Church members with roles and profiles
- **RefreshToken**: Secure token rotation
- **Attendance**: Check-in records with geolocation
- **Event**: Church events with geofence settings
- **TrainingModule**: Worker training courses
- **WorkerTrainingProgress**: Training completion tracking
- **ChurchLocation**: Check-in locations

## API Endpoints

All endpoints are prefixed with `/api`

### Public
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `GET /events/upcoming` - Upcoming events
- `GET /locations/default` - Default location

### Protected (Member+)
- `GET /auth/me` - Current user
- `POST /attendance/check-in` - Check in
- `GET /attendance/my-history` - Own attendance
- `GET /users/profile` - Own profile
- `PATCH /users/profile` - Update profile

### Worker+
- `GET /training/dashboard` - Training progress
- `PATCH /training/progress/:id` - Update progress

### Leader+
- `GET /attendance` - All attendance
- `POST /events` - Create event
- `GET /users/workers` - Worker list
- `PATCH /users/:id/worker-status` - Update worker

### Admin
- `GET /users` - All members
- `PATCH /users/:id/role` - Change role
- `DELETE /users/:id` - Delete user
- `POST /locations` - Add location

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Server
PORT=8000
NODE_ENV=development

# JWT
JWT_ACCESS_SECRET="your-secret"
JWT_REFRESH_SECRET="your-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Default Church Location
DEFAULT_CHURCH_LATITUDE=6.5244
DEFAULT_CHURCH_LONGITUDE=3.3792
DEFAULT_CHURCH_RADIUS_METERS=100
DEFAULT_CHURCH_NAME="Gateway International Church"
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB |
| `npm run db:migrate` | Create migration |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gic.church | admin123456 |
| Leader | leader@gic.church | leader123456 |
| Worker | worker@gic.church | worker123456 |
| Member | member@gic.church | member123456 |
