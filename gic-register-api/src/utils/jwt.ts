import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AccessTokenPayload, RefreshTokenPayload } from '../types';

/**
 * Generates a JWT access token for authentication
 * Access tokens are short-lived (default 15 minutes)
 */
export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  } as jwt.SignOptions);
}

/**
 * Generates a JWT refresh token for token rotation
 * Refresh tokens are longer-lived (default 7 days)
 */
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
}

/**
 * Verifies and decodes an access token
 * @throws JsonWebTokenError if token is invalid
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
}

/**
 * Verifies and decodes a refresh token
 * @throws JsonWebTokenError if token is invalid
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
}

/**
 * Parses refresh token expiry duration to milliseconds
 */
export function getRefreshTokenExpiryMs(): number {
  const expiresIn = config.jwt.refreshExpiresIn;
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000; // Default 7 days
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * (multipliers[unit] || multipliers.d);
}
