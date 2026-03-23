import { v4 as uuidv4 } from 'uuid';
import { User } from '@prisma/client';
import { userRepository, refreshTokenRepository } from '../repositories';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiryMs,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  toUserDTO,
} from '../utils';
import { RegisterInput, LoginInput } from '../validators';
import { AuthResponse, AuthTokens, UserDTO } from '../types';

export const authService = {
  /**
   * Registers a new user account
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await userRepository.findByEmail(input.email.toLowerCase());
    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await userRepository.create({
      email: input.email.toLowerCase(),
      passwordHash,
      fullName: input.fullName,
      dateOfBirth: input.dateOfBirth,
      phone: input.phone,
      address: input.address,
    });

    const tokens = await this.generateTokens(user);

    return {
      user: toUserDTO(user),
      tokens,
    };
  },

  /**
   * Authenticates a user and returns tokens
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(input.email.toLowerCase());
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await verifyPassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: toUserDTO(user),
      tokens,
    };
  },

  /**
   * Refreshes access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const storedToken = await refreshTokenRepository.findByToken(refreshToken);
    if (!storedToken) {
      throw new UnauthorizedError('Refresh token not found');
    }

    if (storedToken.revoked) {
      await refreshTokenRepository.revokeAllForUser(storedToken.userId);
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token has expired');
    }

    const user = storedToken.user;
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const newTokens = await this.generateTokens(user);

    await refreshTokenRepository.revoke(storedToken.id, newTokens.refreshToken);

    return newTokens;
  },

  /**
   * Logs out user by revoking refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    const storedToken = await refreshTokenRepository.findByToken(refreshToken);
    if (storedToken && !storedToken.revoked) {
      await refreshTokenRepository.revoke(storedToken.id);
    }
  },

  /**
   * Logs out user from all devices
   */
  async logoutAll(userId: string): Promise<void> {
    await refreshTokenRepository.revokeAllForUser(userId);
  },

  /**
   * Gets the current user profile
   */
  async getCurrentUser(userId: string): Promise<UserDTO> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return toUserDTO(user);
  },

  /**
   * Generates access and refresh tokens.
   * Includes role hierarchy context (adminSubRole, directorateId, unitId) in the access token
   * so RBAC middleware can perform scoped authorization without extra DB lookups.
   */
  async generateTokens(user: User): Promise<AuthTokens> {
    const tokenId = uuidv4();

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      adminSubRole: user.adminSubRole,
      directorateId: user.directorateId,
      unitId: user.unitId,
    });

    const refreshTokenValue = generateRefreshToken({
      userId: user.id,
      tokenId,
    });

    const expiresAt = new Date(Date.now() + getRefreshTokenExpiryMs());

    await refreshTokenRepository.create({
      token: refreshTokenValue,
      userId: user.id,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  },
};
