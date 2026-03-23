import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import type { Role } from '@/types';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

/** Role hierarchy levels for inheritance-based checks */
const ROLE_LEVEL: Record<Role, number> = {
  MEMBER: 1,
  WORKER: 2,
  LEADER: 3,
  DIRECTORATE: 4,
  ADMIN: 5,
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  minRole?: Role;
}

export function ProtectedRoute({ children, allowedRoles, minRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (minRole && user && ROLE_LEVEL[user.role] < ROLE_LEVEL[minRole]) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Convenience wrappers for common role checks
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['ADMIN']}>{children}</ProtectedRoute>;
}

export function DirectorateRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['DIRECTORATE', 'ADMIN']}>{children}</ProtectedRoute>;
}

export function LeaderRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute minRole="LEADER">{children}</ProtectedRoute>;
}

export function WorkerRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute minRole="WORKER">{children}</ProtectedRoute>;
}
