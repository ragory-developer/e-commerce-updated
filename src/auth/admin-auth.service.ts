// ─── src/auth/admin-auth.service.ts ──────────────────────────

import {
  Injectable,
  UnauthorizedException,
  // BadRequestException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';
import { AdminLoginDto } from './dto';
import { DeviceInfo } from './auth.types';
import { AUTH_CONFIG, AUTH_ERROR } from './auth.constants';
import { PasswordValidator } from './auth.validators';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async adminLogin(dto: AdminLoginDto, deviceInfo: DeviceInfo) {
    const admin = await this.prisma.admin.findFirst({
      where: { email: dto.email.toLowerCase(), deletedAt: null },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        permissions: true,
        isActive: true,
        loginAttempts: true,
        lockedUntil: true,
      },
    });

    // 🔒 Check if admin is locked (prevent brute force)
    if (admin && admin.lockedUntil && new Date() < admin.lockedUntil) {
      this.logger.warn(`[SECURITY] Locked admin attempted login: ${dto.email}`);
      throw new UnauthorizedException(AUTH_ERROR.ACCOUNT_LOCKED);
    }

    // 🔒 Prevent timing attacks with constant comparison
    const dummyHash =
      '$2b$12$KbQiF2Xk5b9VYy8Ej3Z9UeZ5gVxF5D1ZxJHGtJwQ1xExampleDummyHash';
    const hashToCompare = admin?.password ?? dummyHash;

    const passwordValid = await bcrypt.compare(dto.password, hashToCompare);

    if (!admin || !passwordValid) {
      // ❌ Invalid credentials — increment attempts
      if (admin && admin.isActive) {
        const newAttempts = admin.loginAttempts + 1;
        const isLocked = newAttempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS;

        await this.prisma.admin.update({
          where: { id: admin.id },
          data: {
            loginAttempts: newAttempts,
            lockedUntil: isLocked
              ? new Date(Date.now() + AUTH_CONFIG.LOCK_DURATION_MS)
              : null,
          },
        });

        this.logger.warn(
          `[SECURITY] Failed login attempt for ${dto.email}. Attempts: ${newAttempts}/${AUTH_CONFIG.MAX_LOGIN_ATTEMPTS}`,
        );
      }

      throw new UnauthorizedException(AUTH_ERROR.INVALID_CREDENTIALS);
    }

    // ✅ Valid password
    if (!admin.isActive) {
      this.logger.warn(
        `[SECURITY] Inactive admin attempted login: ${dto.email}`,
      );
      throw new UnauthorizedException(AUTH_ERROR.ACCOUNT_DISABLED);
    }

    // 🟢 Reset login attempts on successful login
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: deviceInfo.ipAddress,
      },
    });

    // Issue tokens
    const result = await this.tokenService.loginAndIssueTokens(
      'ADMIN',
      admin.id,
      deviceInfo,
      admin.role,
      admin.permissions,
    );

    this.logger.log(
      `[AUTH] Admin login successful: ${admin.email} from IP: ${deviceInfo.ipAddress}`,
    );

    return result;
  }

  async validateAdminPassword(
    adminId: string,
    password: string,
  ): Promise<boolean> {
    const admin = await this.prisma.admin.findFirst({
      where: { id: adminId, deletedAt: null },
      select: { password: true },
    });

    if (!admin) return false;
    return bcrypt.compare(password, admin.password);
  }

  async changePassword(
    adminId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Validate new password strength
    PasswordValidator.validate(newPassword);

    // Verify current password
    const admin = await this.prisma.admin.findFirst({
      where: { id: adminId, deletedAt: null },
      select: { password: true },
    });

    if (!admin) {
      throw new UnauthorizedException(AUTH_ERROR.ADMIN_NOT_FOUND);
    }

    const currentPasswordValid = await bcrypt.compare(
      currentPassword,
      admin.password,
    );
    if (!currentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password with strong rounds
    const hashedPassword = await bcrypt.hash(
      newPassword,
      AUTH_CONFIG.BCRYPT_ROUNDS,
    );

    await this.prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword },
    });

    // Force re-login on all devices
    await this.tokenService.revokeAllOwnerTokens(
      'ADMIN',
      adminId,
      'All_DEVICES',
    );

    this.logger.log(`[AUTH] Password changed for admin ${adminId}`);
  }
}
