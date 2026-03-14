// ─── src/auth/token.service.ts ──────────────────────────────

import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import {
  AuthResult,
  DeviceInfo,
  JwtPayload,
  RegistrationTokenPayload,
  TokenPair,
} from './auth.types';
import {
  AUTH_CONFIG,
  AUTH_ERROR,
  REGISTRATION_TOKEN_EXPIRES_IN,
} from './auth.constants';
import { AdminPermission, AdminRole, AuthUserType } from '@prisma/client';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly ConfigService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Hash refresh token before DB storage ───────────────────
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // ─── Generate secure refresh token ──────────────────────────
  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  // ─── Generate JWT access token ──────────────────────────────
  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
      secret: this.ConfigService.getOrThrow<string>('jwt.secret'),
    });
  }

  // ─── Registration token (OTP verified proof) ────────────────
  generateRegistrationToken(phone: string): string {
    const payload: RegistrationTokenPayload = {
      sub: phone,
      purpose: 'REGISTRATION',
    };

    return this.jwtService.sign(payload, {
      expiresIn: REGISTRATION_TOKEN_EXPIRES_IN,
      secret: this.ConfigService.getOrThrow<string>('jwt.secret'),
    });
  }

  verifyRegistrationToken(token: string): RegistrationTokenPayload {
    try {
      const payload = this.jwtService.verify<RegistrationTokenPayload>(token, {
        secret: this.ConfigService.getOrThrow<string>('jwt.secret'),
      });

      if (payload.purpose !== 'REGISTRATION') {
        throw new UnauthorizedException(
          AUTH_ERROR.OTP_REGISTRATION_TOKEN_INVALID,
        );
      }

      return payload;
    } catch {
      throw new UnauthorizedException(
        AUTH_ERROR.OTP_REGISTRATION_TOKEN_INVALID,
      );
    }
  }

  // ─── Device management ──────────────────────────────────────
  // async upsertDevice(
  //   userType: AuthUserType,
  //   ownerId: string,
  //   deviceInfo: DeviceInfo,
  // ): Promise<string> {
  //   const ownerField =
  //     userType === 'ADMIN' ? { adminId: ownerId } : { customerId: ownerId };

  //   const existing = await this.prisma.device.findFirst({
  //     where: {
  //       ...ownerField,
  //       deviceId: deviceInfo.clientDeviceId,
  //     },
  //     select: { id: true, userAgent: true, ipAddress: true, isActive: true },
  //   });

  //   if (existing) {
  //     await this.prisma.device.update({
  //       where: { id: existing.id },
  //       data: {
  //         isActive: true,
  //         revokedAt: null,
  //         lastActiveAt: new Date(),
  //         deviceName: deviceInfo.deviceName ?? undefined,
  //         deviceType: deviceInfo.deviceType ?? undefined,
  //         userAgent: deviceInfo.userAgent ?? null,
  //         ipAddress: deviceInfo.ipAddress ?? null,
  //       },
  //     });

  //     return existing.id;
  //   }

  //   const device = await this.prisma.device.create({
  //     data: {
  //       ...ownerField,
  //       userType,
  //       deviceId: deviceInfo.clientDeviceId,
  //       deviceName: deviceInfo.deviceName ?? null,
  //       deviceType: deviceInfo.deviceType ?? undefined,
  //       userAgent: deviceInfo.userAgent ?? null,
  //       ipAddress: deviceInfo.ipAddress ?? null,
  //     },
  //     select: { id: true },
  //   });

  //   return device.id;
  // }

  // ─── Device management ──────────────────────────────────────
  async upsertDevice(
    userType: AuthUserType,
    ownerId: string,
    deviceInfo: DeviceInfo,
  ): Promise<string> {
    const ownerField =
      userType === 'ADMIN' ? { adminId: ownerId } : { customerId: ownerId };

    const existing = await this.prisma.device.findFirst({
      where: {
        ...ownerField,
        deviceId: deviceInfo.clientDeviceId,
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        isActive: true,
      },
    });

    if (existing) {
      //  SECURITY: Check if device fingerprint drastically changed
      const uaChanged =
        existing.userAgent &&
        deviceInfo.userAgent &&
        existing.userAgent !== deviceInfo.userAgent &&
        !this.isSimilarUserAgent(existing.userAgent, deviceInfo.userAgent);

      const ipChanged =
        existing.ipAddress &&
        deviceInfo.ipAddress &&
        existing.ipAddress !== deviceInfo.ipAddress;

      if (uaChanged && ipChanged) {
        this.logger.warn(
          `[SECURITY] Device fingerprint changed for ${deviceInfo.clientDeviceId}. ` +
            `Old: ${existing.userAgent} / ${existing.ipAddress}, ` +
            `New: ${deviceInfo.userAgent} / ${deviceInfo.ipAddress}`,
        );

        // Revoke old device
        await this.prisma.device.update({
          where: { id: existing.id },
          data: {
            isActive: false,
            revokedAt: new Date(),
          },
        });

        // Create new device with same clientDeviceId but new DB ID
        const newDevice = await this.prisma.device.create({
          data: {
            ...ownerField,
            userType,
            deviceId: deviceInfo.clientDeviceId,
            deviceName: deviceInfo.deviceName ?? null,
            deviceType: deviceInfo.deviceType ?? null,
            userAgent: deviceInfo.userAgent ?? null,
            ipAddress: deviceInfo.ipAddress ?? null,
          },
          select: { id: true },
        });

        return newDevice.id;
      }

      //  Normal update
      await this.prisma.device.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          revokedAt: null,
          lastActiveAt: new Date(),
          deviceName: deviceInfo.deviceName ?? null,
          deviceType: deviceInfo.deviceType ?? null,
          userAgent: deviceInfo.userAgent ?? null,
          ipAddress: deviceInfo.ipAddress ?? null,
        },
      });

      return existing.id;
    }

    // Create new device
    const device = await this.prisma.device.create({
      data: {
        ...ownerField,
        userType,
        deviceId: deviceInfo.clientDeviceId,
        deviceName: deviceInfo.deviceName ?? null,
        deviceType: deviceInfo.deviceType ?? null,
        userAgent: deviceInfo.userAgent ?? null,
        ipAddress: deviceInfo.ipAddress ?? null,
      },
      select: { id: true },
    });

    return device.id;
  }

  /**
   * Check if user agents are similar (e.g., Chrome version update)
   */
  private isSimilarUserAgent(oldUa: string, newUa: string): boolean {
    const getBrowserName = (ua: string) => {
      if (ua.includes('Chrome')) return 'Chrome';
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Safari')) return 'Safari';
      if (ua.includes('Edge')) return 'Edge';
      return 'Unknown';
    };

    return getBrowserName(oldUa) === getBrowserName(newUa);
  }

  // ─── Issue access + refresh tokens ──────────────────────────
  async issuesTokenPair(
    userType: AuthUserType,
    ownerId: string,
    deviceDbId: string,
    role?: AdminRole,
    permission?: AdminPermission[],
    tokenFamily?: string,
  ): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: ownerId,
      type: userType,
      deviceId: deviceDbId,
      role,
      permissions: permission,
    };

    const accessToken = this.generateAccessToken(payload);

    const refreshToken = this.generateRefreshToken();
    const hashedRefreshToken = this.hashToken(refreshToken);

    const family = tokenFamily ?? crypto.randomUUID();

    const expireAt = new Date(
      Date.now() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_MS,
    );

    const ownerField =
      userType === 'ADMIN' ? { adminId: ownerId } : { customerId: ownerId };

    // 🔐 Production-level metadata storage
    await this.prisma.authToken.create({
      data: {
        userType,
        ...ownerField,
        deviceId: deviceDbId,
        tokenFamily: family,
        tokenHash: hashedRefreshToken,
        expiresAt: expireAt,
        issuedAt: new Date(),
        revoked: false,
        revokedAt: null,
        revokedReason: null,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRES_IN / 1000,
    };
  }

  // ─── Login helper ───────────────────────────────────────────
  async loginAndIssueTokens(
    userType: AuthUserType,
    ownerId: string,
    deviceInfo: DeviceInfo,
    role?: AdminRole,
    permission?: AdminPermission[],
  ): Promise<AuthResult> {
    const deviceDbId = await this.upsertDevice(userType, ownerId, deviceInfo);

    const tokens = await this.issuesTokenPair(
      userType,
      ownerId,
      deviceDbId,
      role,
      permission,
    );

    return { tokens, deviceDbId };
  }

  // ─── Refresh token rotation ─────────────────────────────────
  async rotateRefreshToken(
    rawRefreshToken: string,
  ): Promise<{ tokens: TokenPair; UserType: AuthUserType; ownerId: string }> {
    const hashedToken = this.hashToken(rawRefreshToken);

    const tokenRecord = await this.prisma.authToken.findFirst({
      where: { tokenHash: hashedToken },
      include: { device: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException(AUTH_ERROR.TOKEN_INVALID);
    }

    if (tokenRecord.revoked) {
      this.logger.error(
        ` [SECURITY] Token reuse detected for family ${tokenRecord.tokenFamily} `,
      );

      await this.prisma.authToken.updateMany({
        where: {
          tokenFamily: tokenRecord.tokenFamily,
          revoked: false,
        },
        data: {
          revoked: true,
          revokedAt: new Date(),
          revokedReason: 'TOKEN_REUSE_DETECTED',
        },
      });

      if (tokenRecord.deviceId) {
        await this.prisma.device.update({
          where: { id: tokenRecord.deviceId },
          data: {
            isActive: false,
            revokedAt: new Date(),
          },
        });
      }
      throw new UnauthorizedException(AUTH_ERROR.REFRESH_TOKEN_REUSE);
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException(AUTH_ERROR.TOKEN_INVALID);
    }

    if (!tokenRecord.device || !tokenRecord.device.isActive) {
      throw new UnauthorizedException(AUTH_ERROR.TOKEN_REVOKED);
    }

    const { userType, adminId, customerId, tokenFamily, deviceId } =
      tokenRecord;

    const ownerId = (adminId ?? customerId)!;

    await this.prisma.authToken.update({
      where: { id: tokenRecord.id },
      data: {
        revoked: true,
        revokedAt: new Date(),
        revokedReason: 'ROTATED',
      },
    });

    const tokens = await this.issuesTokenPair(
      userType,
      ownerId,
      deviceId!,
      undefined,
      undefined,
      tokenFamily,
    );

    return { tokens, UserType: userType, ownerId };
  }

  // ─── Token revocation ───────────────────────────────────────
  async revokeToken(rawRefreshToken: string): Promise<void> {
    const hashedToken = this.hashToken(rawRefreshToken);

    await this.prisma.authToken.updateMany({
      where: { tokenHash: hashedToken, revoked: false },
      data: {
        revoked: true,
        revokedAt: new Date(),
        revokedReason: 'LOGOUT',
      },
    });
  }

  async revokeAllOwnerTokens(
    userType: AuthUserType,
    ownerId: string,
    reason: 'All_DEVICES',
  ): Promise<void> {
    const ownerWhere =
      userType === 'ADMIN' ? { adminId: ownerId } : { customerId: ownerId };

    await this.prisma.authToken.updateMany({
      where: { ...ownerWhere, revoked: false },
      data: {
        revoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });

    await this.prisma.device.updateMany({
      where: { ...ownerWhere, isActive: true },
      data: { isActive: false, revokedAt: new Date() },
    });
  }

  // ─── Access token validation helper ─────────────────────────
  async validate(payload: JwtPayload) {
    const { sub, type, deviceId, role, permissions } = payload;

    const device = await this.prisma.device.findFirst({
      where: {
        id: deviceId,
        isActive: true,
        revokedAt: null,
      },
      select: { id: true },
    });

    if (!device) {
      throw new UnauthorizedException(AUTH_ERROR.DEVICE_REVOKED);
    }

    const authToken = await this.prisma.authToken.findFirst({
      where: {
        deviceId,
        revoked: false,
      },
    });

    if (!authToken) {
      throw new UnauthorizedException(AUTH_ERROR.TOKEN_REVOKED);
    }

    if (type === 'ADMIN') {
      const admin = await this.prisma.admin.findFirst({
        where: { id: sub, isActive: true, deletedAt: null },
        select: { id: true },
      });

      if (!admin) {
        throw new UnauthorizedException(AUTH_ERROR.ACCOUNT_DISABLED);
      }
    } else {
      const customer = await this.prisma.customer.findFirst({
        where: { id: sub, isActive: true, deletedAt: null },
        select: { id: true },
      });

      if (!customer) {
        throw new UnauthorizedException(AUTH_ERROR.ACCOUNT_DISABLED);
      }
    }

    return { id: sub, type, deviceId, role, permissions };
  }

  // ───────────────────────── Revoke all tokens for a specific device ─────────────────────────

  async revokeDeviceTokens(deviceDbId: string, reason: string): Promise<void> {
    //  Validate device exists first
    const device = await this.prisma.device.findUnique({
      where: { id: deviceDbId },
      select: { id: true, isActive: true },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    //  Revoke all tokens for this device
    await this.prisma.authToken.updateMany({
      where: {
        deviceId: deviceDbId,
        revoked: false,
      },
      data: {
        revoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });

    //  Mark device as inactive
    await this.prisma.device.update({
      where: { id: deviceDbId },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });

    this.logger.log(`Device ${deviceDbId} revoked. Reason: ${reason}`);
  }

  // ─── Cleanup job ────────────────────────────────────────────
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.authToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          {
            revoked: true,
            revokedAt: {
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired auth tokens`);

    return result.count;
  }
}
