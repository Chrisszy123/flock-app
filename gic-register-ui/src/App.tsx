import { Routes, Route, Navigate } from 'react-router-dom';
import { GuestRoute } from '@/components/guards/GuestRoute';
import {
  ProtectedRoute,
  WorkerRoute,
  LeaderRoute,
  DirectorateRoute,
  AdminRoute,
} from '@/components/guards/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NotificationPopup } from '@/components/ui/NotificationPopup';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Dashboard Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { EventsPage } from '@/pages/events/EventsPage';
import { TrainingPage } from '@/pages/training/TrainingPage';
import { WorkersPage } from '@/pages/workers/WorkersPage';
import { MembersPage } from '@/pages/members/MembersPage';
import { LocationsPage } from '@/pages/locations/LocationsPage';

// New Pages
import { NewsPage } from '@/pages/news/NewsPage';
import { ResourcesPage } from '@/pages/resources/ResourcesPage';
import { PermissionsPage } from '@/pages/permissions/PermissionsPage';
import { FinancePage } from '@/pages/finance/FinancePage';
import { WorkforcePage } from '@/pages/workforce/WorkforcePage';
import { BroadcastPage } from '@/pages/broadcast/BroadcastPage';

function App() {
  return (
    <>
      {/* Real-time admin broadcast notification popup */}
      <NotificationPopup />

      <Routes>
        {/* Public/Guest Routes */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

        {/* ─── All Authenticated Users ──────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <EventsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/news"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NewsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ResourcesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <FinancePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ─── Worker Routes ────────────────────────────────────── */}
        <Route
          path="/training"
          element={
            <WorkerRoute>
              <DashboardLayout>
                <TrainingPage />
              </DashboardLayout>
            </WorkerRoute>
          }
        />
        <Route
          path="/permissions"
          element={
            <WorkerRoute>
              <DashboardLayout>
                <PermissionsPage />
              </DashboardLayout>
            </WorkerRoute>
          }
        />

        {/* ─── Leader Routes ────────────────────────────────────── */}
        <Route
          path="/workers"
          element={
            <LeaderRoute>
              <DashboardLayout>
                <WorkersPage />
              </DashboardLayout>
            </LeaderRoute>
          }
        />

        {/* ─── Directorate Routes ───────────────────────────────── */}
        <Route
          path="/workforce"
          element={
            <DirectorateRoute>
              <DashboardLayout>
                <WorkforcePage />
              </DashboardLayout>
            </DirectorateRoute>
          }
        />

        {/* ─── Admin Routes ─────────────────────────────────────── */}
        <Route
          path="/members"
          element={
            <AdminRoute>
              <DashboardLayout>
                <MembersPage />
              </DashboardLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/locations"
          element={
            <AdminRoute>
              <DashboardLayout>
                <LocationsPage />
              </DashboardLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/broadcast"
          element={
            <AdminRoute>
              <DashboardLayout>
                <BroadcastPage />
              </DashboardLayout>
            </AdminRoute>
          }
        />

        {/* ─── Redirects ────────────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
