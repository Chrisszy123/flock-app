import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, Role, AdminSubRole } from '../types';
import { verifyAccessToken, UnauthorizedError, ForbiddenError } from '../utils';

/**
 * Role hierarchy levels — higher number = higher privilege.
 * Used for inheritance-based permission checks.
 */
const ROLE_HIERARCHY: Record<Role, number> = {
  MEMBER: 1,
  WORKER: 2,
  LEADER: 3,
  DIRECTORATE: 4,
  ADMIN: 5,
};

/**
 * Authentication middleware - verifies JWT access token
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const payload = verifyAccessToken(token);
    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired access token'));
    }
  }
}

/**
 * Role-based access control middleware factory.
 * Checks if user has one of the explicitly allowed roles.
 */
export function requireRole(...allowedRoles: Role[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
}

/**
 * Hierarchical role check — grants access if user's role level >= the minimum role level.
 * Supports role inheritance: ADMIN can access anything LEADER can, etc.
 */
export function requireMinRole(minRole: Role) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;

    if (userLevel < requiredLevel) {
      return next(
        new ForbiddenError(
          `Access denied. Minimum role required: ${minRole}`
        )
      );
    }

    next();
  };
}

/**
 * Admin sub-role check — requires ADMIN role with specific sub-role(s).
 */
export function requireAdminSubRole(...subRoles: AdminSubRole[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (req.user.role !== 'ADMIN') {
      return next(new ForbiddenError('Admin access required'));
    }

    if (subRoles.length > 0 && req.user.adminSubRole && !subRoles.includes(req.user.adminSubRole)) {
      return next(
        new ForbiddenError(
          `Access denied. Required admin sub-roles: ${subRoles.join(', ')}`
        )
      );
    }

    next();
  };
}

/**
 * Directorate scoping middleware — ensures DIRECTORATE-role users
 * can only access resources within their own directorate.
 * For ADMIN role, all directorates are accessible.
 */
export function requireDirectorateScope(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  // ADMIN bypasses directorate scoping
  if (req.user.role === 'ADMIN') {
    return next();
  }

  // DIRECTORATE users must have a directorateId
  if (req.user.role === 'DIRECTORATE' && !req.user.directorateId) {
    return next(new ForbiddenError('No directorate assigned'));
  }

  next();
}

/**
 * Unit scoping middleware — ensures LEADER-role users
 * can only access resources within their own unit.
 */
export function requireUnitScope(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  // ADMIN and DIRECTORATE bypass unit scoping
  if (req.user.role === 'ADMIN' || req.user.role === 'DIRECTORATE') {
    return next();
  }

  // LEADER users must have a unitId
  if (req.user.role === 'LEADER' && !req.user.unitId) {
    return next(new ForbiddenError('No unit assigned'));
  }

  next();
}

/**
 * Checks if user's role level is >= the given minimum role (utility function, not middleware).
 */
export function hasMinRole(userRole: Role, minRole: Role): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 0);
}

/**
 * Pre-defined role guards for common access patterns
 */
export const requireAdmin = requireRole('ADMIN');
export const requireDirectorateOrAdmin = requireRole('DIRECTORATE', 'ADMIN');
export const requireLeaderOrAbove = requireMinRole('LEADER');
export const requireLeaderOrAdmin = requireRole('LEADER', 'ADMIN');
export const requireWorkerOrAbove = requireMinRole('WORKER');
export const requireMemberOrAbove = requireMinRole('MEMBER');

/**
 * Optional authentication - attaches user if token is valid, but doesn't fail if missing
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const payload = verifyAccessToken(token);
        req.user = payload;
      }
    }

    next();
  } catch {
    next();
  }
}
