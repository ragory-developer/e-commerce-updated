// ─── src/auth/admin-auth.service.ts ──────────────────────────

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AdminRole, AdminPermission } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';
import {
  AdminLoginDto,
  CreateAdminDto,
  UpdateAdminPermissionsDto,
  UpdateAdminRoleDto,
} from './dto';
import { DeviceInfo, AuthResult } from './auth.types';
import { AUTH_CONFIG, AUTH_ERROR } from './auth.constants';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  // ─── Admin Login ──────────────────────────────────────────────
  async login(dto: AdminLoginDto, deviceInfo: DeviceInfo): Promise<AuthResult> {
    const admin = await this.prisma.admin.findFirst({
      where: {
        email: dto.email.toLowerCase(),
        deletedAt: null,
      },
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

    // ─── Account not found (use same error as wrong password to prevent enumeration)
    if (!admin) {
      throw new UnauthorizedException(AUTH_ERROR.INVALID_CREDENTIALS);
    }

    // ─── Account locked check ─────────────────────────────────────
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new UnauthorizedException(AUTH_ERROR.ACCOUNT_LOCKED);
    }

    // ─── Account disabled ─────────────────────────────────────────
    if (!admin.isActive) {
      throw new UnauthorizedException(AUTH_ERROR.ACCOUNT_DISABLED);
    }

    // ─── Password check ───────────────────────────────────────────
    const passwordValid = await bcrypt.compare(dto.password, admin.password);
    if (!passwordValid) {
      await this.incrementLoginAttempts(admin.id, 'ADMIN');
      throw new UnauthorizedException(AUTH_ERROR.INVALID_CREDENTIALS);
    }

    // ─── Reset attempts on success ────────────────────────────────
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: deviceInfo.ipAddress ?? null,
      },
    });

    // ─── Issue tokens ─────────────────────────────────────────────
    return this.tokenService.loginAndIssueTokens(
      'ADMIN',
      admin.id,
      deviceInfo,
      admin.role,
      admin.permissions,
    );
  }

  // ─── Create Admin (only SUPERADMIN can do this) ───────────────
  async createAdmin(
    dto: CreateAdminDto,
    createdBy: string,
    callerRole: AdminRole,
  ): Promise<{ id: string; email: string; role: AdminRole }> {
    // Only SUPERADMIN can create other admins
    if (callerRole !== AdminRole.SUPERADMIN) {
      throw new ForbiddenException(AUTH_ERROR.ADMIN_INSUFFICIENT_ROLE);
    }

    // Cannot create another SUPERADMIN
    if (dto.role === AdminRole.SUPERADMIN) {
      throw new ForbiddenException('Cannot create another SUPERADMIN');
    }

    const exists = await this.prisma.admin.findFirst({
      where: { email: dto.email.toLowerCase(), deletedAt: null },
      select: { id: true },
    });
    if (exists) {
      throw new ConflictException(AUTH_ERROR.ADMIN_EMAIL_TAKEN);
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      AUTH_CONFIG.BCRYPT_ROUNDS,
    );

    const admin = await this.prisma.admin.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email.toLowerCase(),
        phone: dto.phone ?? null,
        password: hashedPassword,
        role: dto.role ?? AdminRole.ADMIN,
        permissions: dto.permissions ?? [],
        isActive: true,
        createdBy,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    this.logger.log(`Admin created: ${admin.email} by ${createdBy}`);
    return admin;
  }

  // ─── Seed Super Admin (called on app bootstrap) ───────────────
  async seedSuperAdmin(): Promise<void> {
    const email = AUTH_CONFIG.SUPER_ADMIN_EMAIL;
    if (!email) {
      this.logger.warn('SUPER_ADMIN_EMAIL not set, skipping seed');
      return;
    }

    const existing = await this.prisma.admin.findFirst({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (existing) {
      this.logger.log('Super admin already exists, skipping seed');
      return;
    }

    const hashedPassword = await bcrypt.hash(
      AUTH_CONFIG.SUPER_ADMIN_PASSWORD,
      AUTH_CONFIG.BCRYPT_ROUNDS,
    );

    await this.prisma.admin.create({
      data: {
        firstName: AUTH_CONFIG.SUPER_ADMIN_FIRST_NAME,
        lastName: AUTH_CONFIG.SUPER_ADMIN_LAST_NAME,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: AdminRole.SUPERADMIN,
        permissions: Object.values(AdminPermission),
        isActive: true,
      },
    });

    this.logger.log(`Super admin seeded: ${email}`);
  }

  // ─── Update Admin Permissions ─────────────────────────────────
  async updatePermissions(
    targetId: string,
    dto: UpdateAdminPermissionsDto,
    callerRole: AdminRole,
  ): Promise<void> {
    if (callerRole !== AdminRole.SUPERADMIN) {
      throw new ForbiddenException(AUTH_ERROR.ADMIN_INSUFFICIENT_ROLE);
    }

    const target = await this.prisma.admin.findFirst({
      where: { id: targetId, deletedAt: null },
      select: { id: true, role: true },
    });
    if (!target) throw new NotFoundException(AUTH_ERROR.ADMIN_NOT_FOUND);
    if (target.role === AdminRole.SUPERADMIN) {
      throw new ForbiddenException('Cannot modify SUPERADMIN permissions');
    }

    await this.prisma.admin.update({
      where: { id: targetId },
      data: { permissions: dto.permissions },
    });
  }

  // ─── Update Admin Role ────────────────────────────────────────
  async updateRole(
    targetId: string,
    dto: UpdateAdminRoleDto,
    callerRole: AdminRole,
  ): Promise<void> {
    if (callerRole !== AdminRole.SUPERADMIN) {
      throw new ForbiddenException(AUTH_ERROR.ADMIN_INSUFFICIENT_ROLE);
    }
    if (dto.role === AdminRole.SUPERADMIN) {
      throw new ForbiddenException('Cannot promote to SUPERADMIN');
    }

    const target = await this.prisma.admin.findFirst({
      where: { id: targetId, deletedAt: null },
      select: { id: true, role: true },
    });
    if (!target) throw new NotFoundException(AUTH_ERROR.ADMIN_NOT_FOUND);
    if (target.role === AdminRole.SUPERADMIN) {
      throw new ForbiddenException('Cannot change SUPERADMIN role');
    }

    await this.prisma.admin.update({
      where: { id: targetId },
      data: { role: dto.role },
    });
  }

  // ─── Enable / Disable Admin ───────────────────────────────────
  async setActiveStatus(
    targetId: string,
    isActive: boolean,
    callerRole: AdminRole,
    callerId: string,
  ): Promise<void> {
    if (callerRole !== AdminRole.SUPERADMIN) {
      throw new ForbiddenException(AUTH_ERROR.ADMIN_INSUFFICIENT_ROLE);
    }
    if (targetId === callerId) {
      throw new BadRequestException('Cannot modify your own status');
    }

    const target = await this.prisma.admin.findFirst({
      where: { id: targetId, deletedAt: null },
      select: { id: true, role: true },
    });
    if (!target) throw new NotFoundException(AUTH_ERROR.ADMIN_NOT_FOUND);
    if (target.role === AdminRole.SUPERADMIN) {
      throw new ForbiddenException('Cannot disable SUPERADMIN');
    }

    await this.prisma.admin.update({
      where: { id: targetId },
      data: { isActive },
    });

    // If disabling, revoke all their tokens
    if (!isActive) {
      await this.tokenService.revokeAllOwnerTokens(
        'ADMIN',
        targetId,
        'ACCOUNT_DISABLED',
      );
    }
  }

  // ─── Soft Delete Admin ────────────────────────────────────────
  async deleteAdmin(
    targetId: string,
    callerRole: AdminRole,
    callerId: string,
  ): Promise<void> {
    if (callerRole !== AdminRole.SUPERADMIN) {
      throw new ForbiddenException(AUTH_ERROR.ADMIN_INSUFFICIENT_ROLE);
    }
    if (targetId === callerId) {
      throw new BadRequestException('Cannot delete yourself');
    }

    const target = await this.prisma.admin.findFirst({
      where: { id: targetId, deletedAt: null },
      select: { id: true, role: true },
    });
    if (!target) throw new NotFoundException(AUTH_ERROR.ADMIN_NOT_FOUND);
    if (target.role === AdminRole.SUPERADMIN) {
      throw new ForbiddenException('Cannot delete SUPERADMIN');
    }

    // Revoke all tokens first
    await this.tokenService.revokeAllOwnerTokens(
      'ADMIN',
      targetId,
      'ACCOUNT_DELETED',
    );

    await this.prisma.admin.update({
      where: { id: targetId },
      data: { deletedAt: new Date(), deletedBy: callerId, isActive: false },
    });
  }

  // ─── List Admins ──────────────────────────────────────────────
  async listAdmins(callerRole: AdminRole) {
    if (callerRole !== AdminRole.SUPERADMIN) {
      throw new ForbiddenException(AUTH_ERROR.ADMIN_INSUFFICIENT_ROLE);
    }

    return this.prisma.admin.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        permissions: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Get Admin Profile ────────────────────────────────────────
  async getAdminProfile(adminId: string) {
    const admin = await this.prisma.admin.findFirst({
      where: { id: adminId, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        permissions: true,
        isActive: true,
        lastLoginAt: true,
        avatar: true,
        createdAt: true,
      },
    });
    if (!admin) throw new NotFoundException(AUTH_ERROR.ADMIN_NOT_FOUND);
    return admin;
  }

  // ─── Increment Login Attempts (shared) ───────────────────────
  private async incrementLoginAttempts(
    id: string,
    userType: 'ADMIN' | 'CUSTOMER',
  ): Promise<void> {
    const model =
      userType === 'ADMIN' ? this.prisma.admin : this.prisma.customer;
    const record = await (model as any).findUnique({
      where: { id },
      select: { loginAttempts: true },
    });

    const newAttempts = (record?.loginAttempts ?? 0) + 1;
    const shouldLock = newAttempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS;

    await (model as any).update({
      where: { id },
      data: {
        loginAttempts: newAttempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + AUTH_CONFIG.LOCK_DURATION_MS)
          : undefined,
      },
    });

    if (shouldLock) {
      this.logger.warn(
        `Account ${id} locked after ${newAttempts} failed attempts`,
      );
    }
  }
}
