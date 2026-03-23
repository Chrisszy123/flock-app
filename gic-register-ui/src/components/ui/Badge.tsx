import { clsx } from 'clsx';
import type { Role, WorkerStatus } from '@/types';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'destructive' | 'secondary' | 'accent';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'secondary', children, className }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    primary: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    destructive: 'bg-red-500/20 text-red-400 border border-red-500/30',
    secondary: 'bg-secondary-500/20 text-secondary-300 border border-secondary-500/30',
    accent: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  };

  return (
    <span className={clsx('badge', variants[variant], className)}>
      {children}
    </span>
  );
}

// Role badge helper
export function RoleBadge({ role }: { role: Role }) {
  const variants: Record<Role, BadgeVariant> = {
    ADMIN: 'danger',
    DIRECTORATE: 'accent',
    LEADER: 'warning',
    WORKER: 'primary',
    MEMBER: 'secondary',
  };

  const labels: Record<Role, string> = {
    ADMIN: 'Admin',
    DIRECTORATE: 'Directorate',
    LEADER: 'Leader',
    WORKER: 'Worker',
    MEMBER: 'Member',
  };

  return <Badge variant={variants[role]}>{labels[role]}</Badge>;
}

// Worker status badge helper
export function WorkerStatusBadge({ status }: { status: WorkerStatus }) {
  const variants: Record<WorkerStatus, BadgeVariant> = {
    ACTIVE: 'success',
    PENDING: 'warning',
    SUSPENDED: 'danger',
    NONE: 'secondary',
  };

  const labels: Record<WorkerStatus, string> = {
    ACTIVE: 'Active',
    PENDING: 'Pending',
    SUSPENDED: 'Suspended',
    NONE: 'N/A',
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
