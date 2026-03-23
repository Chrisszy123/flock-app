# GIC Register UI

Frontend application for the Church Attendance & Workforce Management System.

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Quick Start

### Prerequisites
- Node.js 18+
- Backend API running on port 8000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:5173

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── guards/        # Route protection components
│   ├── layout/        # Layout components (DashboardLayout)
│   └── ui/            # Reusable UI components
├── features/
│   └── auth/          # Auth context and hooks
├── hooks/             # Custom React hooks
├── lib/               # API client, validators
├── pages/             # Page components
│   ├── auth/          # Login, Register
│   ├── dashboard/     # Main dashboard with check-in
│   ├── events/        # Events management
│   ├── locations/     # Church locations (Admin)
│   ├── members/       # Member directory (Admin)
│   ├── profile/       # User profile
│   ├── training/      # Training dashboard
│   └── workers/       # Worker management
├── services/
│   └── api/           # API service layer
└── types/             # TypeScript types
```

## Features by Role

### All Authenticated Users
- **Dashboard**: Geofenced check-in interface
- **Profile**: View/edit personal information
- **Events**: View upcoming events
- **Attendance History**: View own check-ins

### Workers (and above)
- **Training Dashboard**: Track training progress
- Mark modules as complete

### Leaders (and above)
- **Worker Management**: View worker profiles
- Update worker status (Active/Pending/Suspended)
- View worker training progress
- **Event Management**: Create, edit, delete events

### Admins
- **Member Directory**: Search all members
- Change user roles
- Delete users
- **Location Management**: Add/edit church locations

## Key Components

### Geolocation Check-in
- Uses Browser Geolocation API
- Real-time location updates
- Server-side validation (no client trust)
- Visual feedback for distance from church

### Auth Flow
- JWT access tokens in memory
- HTTP-only refresh token cookies
- Auto token refresh on 401
- Protected route guards

### Forms
- Zod schema validation
- React Hook Form integration
- Real-time error messages

## Environment Variables

Create a `.env` file (optional):

```env
VITE_API_URL=http://localhost:8000/api
```

By default, the app proxies `/api` requests to `localhost:8000`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## UI Components

The app includes a complete component library:

- **Button**: Primary, secondary, ghost, danger variants
- **Input**: With icons, error states, hints
- **Select**: Styled dropdown
- **Card**: Container with header/body
- **Badge**: Role and status indicators
- **Modal**: Dialog component
- **Pagination**: Table pagination
- **ProgressBar**: Training progress
- **EmptyState**: Placeholder for empty content
- **LoadingSpinner**: Loading indicators

## Styling

Uses Tailwind CSS with custom configuration:
- Dark theme by default
- Custom color palette (primary, secondary, accent)
- Glass morphism effects
- Smooth animations
- Custom fonts (DM Sans, Playfair Display)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires browser geolocation support for check-in functionality.
