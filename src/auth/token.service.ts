// ─── src/auth/token.service.ts ────────────────────────────────
//
// Responsibilities:
//  - Generate access tokens (stateless JWT)
//  - Generate and hash refresh tokens (stored in DB)
//  - Refresh token rotation with reuse detection
//  - Revoke single device / all devices

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminRole, AdminPermission, AuthUserType } from '@prisma/client';
import * as crypto from 'crypto';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload, TokenPair, DeviceInfo, AuthResult } from './auth.types';
import { AUTH_CONFIG, AUTH_ERROR } from './auth.constants';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Hash a raw token using SHA-256 ──────────────────────────
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // ─── Generate a cryptographically random refresh token ───────
  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  // ─── Issue a JWT access token ─────────────────────────────────
  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
      secret: this.configService.getOrThrow<string>('jwt.secret'),
    });
  }

  // ─── Create or reuse a Device record ──────────────────────────
  // If the client presents the same deviceId again, we update it.
  // Otherwise we create a new Device row.
  async upsertDevice(
    userType: AuthUserType,
    ownerId: string,
    deviceInfo: DeviceInfo,
  ): Promise<string> {
    const isAdmin = userType === 'ADMIN';
    const ownerField = isAdmin ? { adminId: ownerId } : { customerId: ownerId };

    const existing = await this.prisma.device.findFirst({
      where: {
        ...ownerField,
        deviceId: deviceInfo.clientDeviceId,
      },
      select: { id: true },
    });

    if (existing) {
      // Update last active and re-activate if it was revoked
      await this.prisma.device.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          revokedAt: null,
          lastActiveAt: new Date(),
          ipAddress: deviceInfo.ipAddress ?? null,
          userAgent: deviceInfo.userAgent ?? null,
          deviceName: deviceInfo.deviceName ?? undefined,
          deviceType: deviceInfo.deviceType ?? undefined,
        },
      });
      return existing.id;
    }

    // Create a new device record
    const device = await this.prisma.device.create({
      data: {
        ...ownerField,
        userType,
        deviceId: deviceInfo.clientDeviceId,
        deviceName: deviceInfo.deviceName ?? null,
        deviceType: deviceInfo.deviceType ?? null,
        ipAddress: deviceInfo.ipAddress ?? null,
        userAgent: deviceInfo.userAgent ?? null,
      },
      select: { id: true },
    });

    return device.id;
  }

  // ─── Issue access + refresh token pair ────────────────────────
  async issueTokenPair(
    userType: AuthUserType,
    ownerId: string,
    deviceDbId: string,
    role?: AdminRole,
    permissions?: AdminPermission[],
    tokenFamily?: string, // pass existing family on rotation
  ): Promise<TokenPair> {
    // Access token payload (small and stateless)
    const payload: JwtPayload = {
      sub: ownerId,
      type: userType,
      deviceId: deviceDbId,
      role,
      permissions,
    };

    const accessToken = this.generateAccessToken(payload);
    const rawRefresh = this.generateRefreshToken();
    const hashedRefresh = this.hashToken(rawRefresh);
    const family = tokenFamily ?? randomUUID();

    const expiresAt = new Date(
      Date.now() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_MS,
    );

    const ownerField =
      userType === 'ADMIN' ? { adminId: ownerId } : { customerId: ownerId };

    // Store the hashed refresh token in DB
    await this.prisma.authToken.create({
      data: {
        userType,
        ...ownerField,
        deviceId: deviceDbId,
        tokenHash: hashedRefresh,
        tokenFamily: family,
        expiresAt,
        revoked: false,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefresh, // send plain token to client
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  // ─── Full login: upsert device + issue tokens ─────────────────
  async loginAndIssueTokens(
    userType: AuthUserType,
    ownerId: string,
    deviceInfo: DeviceInfo,
    role?: AdminRole,
    permissions?: AdminPermission[],
  ): Promise<AuthResult> {
    const deviceDbId = await this.upsertDevice(userType, ownerId, deviceInfo);
    const tokens = await this.issueTokenPair(
      userType,
      ownerId,
      deviceDbId,
      role,
      permissions,
    );

    return { tokens, deviceDbId };
  }

  // ─── Rotate refresh token (used on /auth/refresh) ─────────────
  // Security model:
  //   1. Verify hash matches a valid, non-revoked, non-expired DB record.
  //   2. If token is already revoked → REUSE DETECTED → revoke entire family.
  //   3. Otherwise → revoke old token, issue new token with same family.
  async rotateRefreshToken(
    rawRefreshToken: string,
    clientDeviceId?: string,
  ): Promise<{ tokens: TokenPair; userType: AuthUserType; ownerId: string }> {
    const hashedToken = this.hashToken(rawRefreshToken);

    // Find the token record (include revoked ones for reuse detection)
    const tokenRecord = await this.prisma.authToken.findFirst({
      where: { tokenHash: hashedToken },
      include: { device: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException(AUTH_ERROR.TOKEN_INVALID);
    }

    // ─── Reuse Detection ──────────────────────────────────────────
    // A token that was already revoked is being re-presented.
    // This means someone got hold of an old refresh token → security breach.
    // Revoke entire token family immediately.
    if (tokenRecord.revoked) {
      this.logger.warn(
        `Refresh token reuse detected! Family: ${tokenRecord.tokenFamily} — revoking all family tokens.`,
      );
      await this.revokeTokenFamily(tokenRecord.tokenFamily, 'SECURITY');
      throw new UnauthorizedException(AUTH_ERROR.REFRESH_TOKEN_REUSE);
    }

    // ─── Expiry Check ─────────────────────────────────────────────
    if (tokenRecord.expiresAt < new Date()) {
      await this.prisma.authToken.update({
        where: { id: tokenRecord.id },
        data: {
          revoked: true,
          revokedAt: new Date(),
          revokedReason: 'EXPIRED',
        },
      });
      throw new UnauthorizedException(AUTH_ERROR.TOKEN_INVALID);
    }

    // ─── Device validation ────────────────────────────────────────
    if (!tokenRecord.device || !tokenRecord.device.isActive) {
      throw new UnauthorizedException(AUTH_ERROR.TOKEN_REVOKED);
    }

    const { userType, adminId, customerId, tokenFamily, deviceId } =
      tokenRecord;
    const ownerId = (adminId ?? customerId)!;

    if (!deviceId) {
      throw new UnauthorizedException(AUTH_ERROR.TOKEN_INVALID);
    }

    // ─── Verify owner is still active ────────────────────────────
    if (userType === 'ADMIN') {
      const admin = await this.prisma.admin.findFirst({
        where: { id: ownerId, isActive: true, deletedAt: null },
        select: { id: true, role: true, permissions: true },
      });
      if (!admin) throw new UnauthorizedException(AUTH_ERROR.ACCOUNT_DISABLED);

      // Revoke old token (rotation)
      await this.prisma.authToken.update({
        where: { id: tokenRecord.id },
        data: {
          revoked: true,
          revokedAt: new Date(),
          revokedReason: 'ROTATION',
        },
      });

      // Issue new token pair with same family
      const tokens = await this.issueTokenPair(
        userType,
        ownerId,
        deviceId,
        admin.role,
        admin.permissions,
        tokenFamily,
      );

      return { tokens, userType, ownerId };
    } else {
      const customer = await this.prisma.customer.findFirst({
        where: { id: ownerId, isActive: true, deletedAt: null },
        select: { id: true },
      });
      if (!customer)
        throw new UnauthorizedException(AUTH_ERROR.ACCOUNT_DISABLED);

      // Revoke old token (rotation)
      await this.prisma.authToken.update({
        where: { id: tokenRecord.id },
        data: {
          revoked: true,
          revokedAt: new Date(),
          revokedReason: 'ROTATION',
        },
      });

      // Issue new token pair with same family
      const tokens = await this.issueTokenPair(
        userType,
        ownerId,
        deviceId,
        undefined,
        undefined,
        tokenFamily,
      );

      return { tokens, userType, ownerId };
    }
  }

  // ─── Revoke a single refresh token (logout this session) ──────
  async revokeToken(rawRefreshToken: string): Promise<void> {
    const hashedToken = this.hashToken(rawRefreshToken);

    await this.prisma.authToken.updateMany({
      where: { tokenHash: hashedToken, revoked: false },
      data: { revoked: true, revokedAt: new Date(), revokedReason: 'LOGOUT' },
    });
  }

  // ─── Revoke all tokens for a device ───────────────────────────
  async revokeDeviceTokens(
    deviceDbId: string,
    reason = 'LOGOUT',
  ): Promise<void> {
    await this.prisma.authToken.updateMany({
      where: { deviceId: deviceDbId, revoked: false },
      data: { revoked: true, revokedAt: new Date(), revokedReason: reason },
    });

    // Also deactivate the device
    await this.prisma.device.update({
      where: { id: deviceDbId },
      data: { isActive: false, revokedAt: new Date() },
    });
  }

  // ─── Revoke all tokens for an owner (all devices) ────────────
  async revokeAllOwnerTokens(
    userType: AuthUserType,
    ownerId: string,
    reason = 'ALL_DEVICES',
  ): Promise<void> {
    const ownerWhere =
      userType === 'ADMIN' ? { adminId: ownerId } : { customerId: ownerId };

    await this.prisma.authToken.updateMany({
      where: { ...ownerWhere, revoked: false },
      data: { revoked: true, revokedAt: new Date(), revokedReason: reason },
    });

    // Deactivate all devices
    await this.prisma.device.updateMany({
      where: { ...ownerWhere, isActive: true },
      data: { isActive: false, revokedAt: new Date() },
    });
  }

  // ─── Revoke entire token family (reuse attack response) ───────
  private async revokeTokenFamily(
    family: string,
    reason: string,
  ): Promise<void> {
    // Revoke all tokens in the family
    const tokens = await this.prisma.authToken.findMany({
      where: { tokenFamily: family },
      select: { deviceId: true },
    });

    await this.prisma.authToken.updateMany({
      where: { tokenFamily: family },
      data: { revoked: true, revokedAt: new Date(), revokedReason: reason },
    });

    // Deactivate all related devices
    const deviceIds = [
      ...new Set(tokens.map((t) => t.deviceId).filter(Boolean)),
    ] as string[];
    if (deviceIds.length > 0) {
      await this.prisma.device.updateMany({
        where: { id: { in: deviceIds } },
        data: { isActive: false, revokedAt: new Date() },
      });
    }
  }

  // ─── Cleanup expired tokens (call from scheduled task) ───────
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.authToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          {
            revoked: true,
            revokedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        ],
      },
    });
    this.logger.log(`Cleaned up ${result.count} expired auth tokens`);
    return result.count;
  }
}
