# Church Management Platform — Upgrade Guide

## What Was Built

Your attendance system has been upgraded to a **full Church Management Platform** with:

### ✅ New Features

1. **Hierarchical Workforce System**
   - 5-level role hierarchy: MEMBER → WORKER → LEADER → DIRECTORATE → ADMIN
   - Directorates and Units for organizational structure
   - Scoped permissions (Leaders manage units, Directorates manage directorates)

2. **Permission Request System**
   - Workers submit absence requests with date ranges
   - Leaders/Directorate/Admin approve or decline with reasons
   - Cannot approve own request
   - Cannot approve if user is suspended

3. **Tithes & Offerings Module**
   - Bank transfer support (upload proof, admin confirms)
   - Cryptocurrency support (wallet tracking, transaction hash)
   - Admin dashboard with statistics
   - Extensible for future Paystack/Stripe integration

4. **News Feed**
   - PUBLIC posts (visible to all)
   - WORKERS_ONLY posts (internal communications)
   - Role-based visibility enforcement at API level

5. **Resources Library**
   - Messages (free download)
   - Books (excerpt + price, fileUrl hidden for paid books)

6. **Events System Enhancements**
   - Cover images (`coverImageUrl`)
   - Gallery images (`galleryImages` JSON array)
   - Social sharing toggle (`allowSharing`)

7. **Real-time Admin Broadcast**
   - WebSocket server on `ws://localhost:8000/ws`
   - Admin sends popup notifications
   - Role-targeted messages
   - Auto-reconnecting client

### 🏗️ Architecture Changes

**Backend:**
- Added 7 new Prisma models
- Created 6 new service modules (workforce, permissions, finance, content, notifications)
- Added 6 new route modules
- Hierarchical RBAC middleware with role inheritance
- WebSocket server integrated with HTTP server

**Frontend:**
- Added 6 new pages (News, Resources, Permissions, Finance, Workforce, Broadcast)
- WebSocket hook for real-time notifications
- NotificationPopup component for admin broadcasts
- Updated route guards with DIRECTORATE role
- Sectioned navigation in DashboardLayout

## Getting Started

### Backend

```bash
cd gic-register-api

# Database is already seeded with:
# - 2 Directorates (Worship, Operations)
# - 3 Units (Worship Team, Choir, Media Team)
# - 5 Test users (Admin, Directorate, Leader, Worker, Member)
# - Training modules
# - Sample event

# Start the API + WebSocket server
npm run dev
```

**Server will start on:**
- API: `http://localhost:8000/api`
- WebSocket: `ws://localhost:8000/ws`
- Health: `http://localhost:8000/health`

### Frontend

```bash
cd gic-register-ui
npm run dev
```

**Frontend will start on:** `http://localhost:5173`

## Test the New Features

### 1. Login as Different Roles

| Email                      | Password           | Role        | Capabilities                              |
|----------------------------|--------------------|-------------|-------------------------------------------|
| admin@gic.church           | admin123456        | ADMIN       | Everything                                |
| directorate@gic.church     | directorate123456  | DIRECTORATE | Manage Worship directorate only           |
| leader@gic.church          | leader123456       | LEADER      | Manage Worship Team unit only             |
| worker@gic.church          | worker123456       | WORKER      | Submit permissions, training, check-in    |
| member@gic.church          | member123456       | MEMBER      | Check-in (events only), view public news  |

### 2. Test Workforce Hierarchy

**As ADMIN:**
1. Go to `/workforce`
2. Create/view directorates and units
3. Go to `/workers` and assign workers to directorates/units
4. Suspend/unsuspend workers

**As DIRECTORATE:**
1. Create units within your directorate
2. Assign workers to your directorate
3. View only workers in your directorate
4. Cannot affect other directorates

**As LEADER:**
1. View workers in your unit
2. Approve permission requests from your unit
3. Cannot manage other units

### 3. Test Permission System

**As WORKER:**
1. Go to `/permissions`
2. Click "New Request"
3. Fill reason, start date, end date
4. Submit

**As LEADER/DIRECTORATE/ADMIN:**
1. Go to `/permissions`
2. See pending requests (scoped by your hierarchy)
3. Approve or decline with reason

### 4. Test Finance

**As any user:**
1. Go to `/finance`
2. Click "Submit Offering"
3. Enter amount, select method (Bank/Crypto)
4. Fill transaction reference or crypto wallet
5. Submit

**As ADMIN:**
1. Go to `/finance`
2. See all offerings
3. See statistics dashboard (total, confirmed, pending)
4. Confirm pending payments

### 5. Test News Feed

**As DIRECTORATE/ADMIN:**
1. Go to `/news`
2. Click "New Post"
3. Select visibility (Public or Workers Only)
4. Create post

**As MEMBER:**
- Can only see PUBLIC posts

**As WORKER+:**
- Can see both PUBLIC and WORKERS_ONLY

### 6. Test Resources

**As ADMIN:**
1. Go to `/resources`
2. Click "Add Resource"
3. Select type (Message or Book)
4. For books: add price and excerpt
5. Create resource

**As any user:**
- Messages show full file URL
- Books with price show excerpt only, file URL is stripped

### 7. Test Admin Broadcast

**As ADMIN:**
1. Go to `/broadcast`
2. Click "Send Broadcast"
3. Write title + message
4. Select target role (optional — leave blank for all users)
5. Send

**As any connected user:**
- A full-screen modal will instantly appear with the notification
- Auto-dismisses after 15 seconds

### 8. Test Events Enhancements

**As DIRECTORATE/ADMIN:**
1. Go to `/events`
2. Create event with:
   - Cover image URL
   - Gallery images (array of URLs)
   - Enable/disable sharing
3. Save

## WebSocket Connection

Frontend automatically connects to WebSocket when authenticated:
- URL: `ws://localhost:8000/ws?token=<jwt>`
- Auto-reconnects every 5s on disconnect
- Heartbeat every 30s to detect stale connections

## Database Schema Overview

```
User (extended)
├── occupation, isSuspended, suspensionReason
├── unitId → Unit
├── directorateId → Directorate
└── marketingOptInEmail, marketingOptInSMS

Directorate
├── units (1:many)
└── members (1:many)

Unit
├── directorate (many:1)
└── members (1:many)

PermissionRequest
├── user
├── approvedBy
└── status (PENDING | APPROVED | DECLINED)

TitheOffering
├── user
├── method (BANK | CRYPTO)
└── status (PENDING | CONFIRMED)

NewsPost
├── createdBy
└── visibility (PUBLIC | WORKERS_ONLY)

Resource
└── type (MESSAGE | BOOK)

AdminNotification
└── targetRole (nullable for all users)

Event (extended)
├── coverImageUrl
├── allowSharing
└── galleryImages (JSON)

Attendance (extended)
└── checkInType (WORKER | MEMBER)
```

## RBAC Hierarchy

```
ADMIN (5)
  ├── LEAD_PASTOR
  ├── ADMIN_PASTOR
  └── SECRETARY
  └── Can do everything

DIRECTORATE (4)
  └── Manages workers in their directorate
  └── Creates units within their directorate
  └── Approves permissions for directorate workers

LEADER (3)
  └── Manages workers in their unit
  └── Approves permissions for unit workers

WORKER (2)
  └── Submits permissions
  └── Training, check-in

MEMBER (1)
  └── Check-in (events only)
  └── View public news
```

## Data Integrity Rules (Enforced)

- ✅ Cannot delete directorate if workers or units exist
- ✅ Cannot suspend admin without admin privilege
- ✅ Cannot approve own permission request
- ✅ Cannot assign worker to multiple directorates
- ✅ One attendance per user per day per event
- ✅ Suspended workers cannot submit permission requests
- ✅ Workers-only news invisible to members

## Production Checklist

Before deploying:

1. **Environment Variables**
   - Change all JWT secrets
   - Set `NODE_ENV=production`
   - Use strong passwords for seed accounts
   - Configure real `DATABASE_URL`

2. **Security**
   - Enable rate limiting (consider `express-rate-limit`)
   - Set up HTTPS/TLS
   - Configure CORS for production domains
   - Review all admin endpoints

3. **Database**
   - Use `npx prisma migrate deploy` in production (not `db:push`)
   - Set up database backups
   - Configure connection pooling if needed

4. **File Uploads**
   - Integrate S3, Cloudinary, or similar for image uploads
   - Update all `imageUrl` fields to use uploaded URLs

5. **Payment Integration**
   - Integrate Paystack or Stripe for automatic confirmation
   - Add webhook handlers for payment status updates

6. **WebSocket**
   - Configure WebSocket behind reverse proxy (nginx/HAProxy)
   - Use WSS (secure WebSocket) in production

## Troubleshooting

**"Can't reach database server"**
- Ensure PostgreSQL is running: `brew services start postgresql@14`
- Check `DATABASE_URL` in `.env`

**"Migration failed"**
- Use `npx prisma db push` for quick schema sync
- Use `npx prisma migrate dev` interactively in terminal
- Use `npx prisma migrate deploy` for production

**WebSocket not connecting**
- Check browser console for errors
- Verify server started successfully
- Ensure JWT token is valid

**Linter errors after TypeScript build**
- Run `npx tsc --noEmit` to check types
- Ensure all new files are exported from index files

## Next Steps

1. Test all features with the 5 seeded accounts
2. Create real directorates and units for your church
3. Invite workers and assign them
4. Configure file upload integration (S3/Cloudinary)
5. Deploy to production (Railway, Render, AWS, etc.)
6. Set up monitoring and logging
7. Configure email/SMS for notifications (optional)

---

**Need help?** Review the README.md for API endpoint documentation.
