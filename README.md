# GIC Church Management Platform

A full-stack church workforce and member management system built with Express, PostgreSQL, Prisma, React, and TypeScript.

## Architecture

```
gic/
├── gic-register-api/    # Backend (Express + Prisma + PostgreSQL)
└── gic-register-ui/     # Frontend (React + TypeScript + Vite)
```

## Features

- **Authentication** — JWT access + refresh tokens with rotation
- **Hierarchical RBAC** — MEMBER → WORKER → LEADER → DIRECTORATE → ADMIN (with admin sub-roles)
- **Attendance** — Geofence-enforced check-in for workers and members
- **Workforce Management** — Directorates, units, worker assignment/suspension
- **Permission System** — Workers request, leaders/directorate/admin approve/decline
- **Tithes & Offerings** — Bank + Crypto with admin confirmation
- **News Feed** — Public + workers-only visibility
- **Resources** — Free messages + paid books (excerpt-only for paid)
- **Events** — Full CRUD with cover images, gallery, sharing
- **Admin Broadcast** — Real-time WebSocket notifications
- **Training** — Module tracking and certification

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Setup

### 1. Database

```bash
createdb gic_register
```

### 2. Backend

```bash
cd gic-register-api

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT secrets, etc.

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

### 3. Frontend

```bash
cd gic-register-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables (Backend)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/gic_register
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Test Accounts (after seeding)

| Role         | Email                      | Password           |
|--------------|----------------------------|---------------------|
| Admin        | admin@gic.church           | admin123456         |
| Directorate  | directorate@gic.church     | directorate123456   |
| Leader       | leader@gic.church          | leader123456        |
| Worker       | worker@gic.church          | worker123456        |
| Member       | member@gic.church          | member123456        |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `POST /api/auth/refresh` — Refresh token
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Current user

### Users
- `GET /api/users/profile` — Get profile
- `PATCH /api/users/profile` — Update profile
- `GET /api/users/workers` — List workers (Leader+)
- `GET /api/users` — Search members (Admin)

### Attendance
- `POST /api/attendance/check-in` — Check in
- `GET /api/attendance/my-history` — My history
- `GET /api/attendance` — All attendance (Leader+)

### Events
- `GET /api/events/upcoming` — Public
- `GET /api/events` — List (authenticated)
- `POST /api/events` — Create (Directorate/Admin)
- `PATCH /api/events/:id` — Update (Directorate/Admin)
- `DELETE /api/events/:id` — Delete (Directorate/Admin)

### Workforce
- `GET /api/workforce/directorates` — List directorates
- `POST /api/workforce/directorates` — Create (Admin)
- `GET /api/workforce/units` — List units
- `POST /api/workforce/units` — Create (Directorate/Admin)
- `POST /api/workforce/workers` — Create worker profile (Leader+)
- `PATCH /api/workforce/workers/:userId/assign` — Assign worker (Directorate/Admin)
- `PATCH /api/workforce/workers/:userId/suspend` — Suspend worker (Leader+)

### Permissions
- `POST /api/permissions` — Submit request (Worker+)
- `GET /api/permissions/my` — My requests
- `GET /api/permissions/pending` — Pending (Leader+)
- `PATCH /api/permissions/:id/decide` — Approve/Decline (Leader+)

### Finance
- `POST /api/finance` — Submit offering
- `GET /api/finance/my` — My offerings
- `GET /api/finance/all` — All offerings (Admin)
- `PATCH /api/finance/:id/confirm` — Confirm payment (Admin)
- `GET /api/finance/stats` — Statistics (Admin)

### News
- `GET /api/news` — Feed (visibility-filtered)
- `POST /api/news` — Create (Directorate/Admin)
- `PATCH /api/news/:id` — Update (Directorate/Admin)
- `DELETE /api/news/:id` — Delete (Admin)

### Resources
- `GET /api/resources` — List (public)
- `POST /api/resources` — Create (Admin)
- `PATCH /api/resources/:id` — Update (Admin)
- `DELETE /api/resources/:id` — Delete (Admin)

### Notifications
- `POST /api/notifications` — Send broadcast (Admin)
- `GET /api/notifications` — History (Admin)

### WebSocket
- `ws://localhost:8000/ws?token=<jwt>` — Real-time notifications

## Role Hierarchy

```
LEVEL 1: MEMBER
LEVEL 2: WORKER
LEVEL 3: LEADER (manages unit)
LEVEL 4: DIRECTORATE (manages directorate)
LEVEL 5: ADMIN (manages everything)
  └── Sub-roles: LEAD_PASTOR, ADMIN_PASTOR, SECRETARY
```

## Data Integrity Rules

- Cannot delete directorate if workers exist
- Cannot suspend admin without admin privilege
- Cannot approve own permission request
- Cannot assign worker to multiple directorates
- One attendance per user per day per event
