// ─── src/auth/customer-auth.service.ts ───────────────────────

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { PhoneOtpService } from '../otp/phone-otp.service';
import { TokenService } from './token.service';
import {
  CustomerRegisterDto,
  CustomerPasswordLoginDto,
  CustomerOtpLoginDto,
  CustomerRequestOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { DeviceInfo, AuthResult } from './auth.types';
import { AUTH_CONFIG, AUTH_ERROR } from './auth.constants';

@Injectable()
export class CustomerAuthService {
  private readonly logger = new Logger(CustomerAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly phoneOtpService: PhoneOtpService,
    private readonly tokenService: TokenService,
  ) {}

  // ─── Step 1: Request OTP for registration ─────────────────────
  // The client calls this first. We send OTP to the phone.
  async requestRegistrationOtp(
    dto: CustomerRequestOtpDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ maskedPhone: string; expiresInSeconds: number }> {
    // If phone already registered as a full account, reject
    const existing = await this.prisma.customer.findFirst({
      where: { phone: dto.phone, deletedAt: null },
      select: { id: true, isGuest: true },
    });

    if (existing && !existing.isGuest) {
      // Phone registered → suggest login instead
      throw new ConflictException(AUTH_ERROR.CUSTOMER_PHONE_TAKEN);
    }

    const result = await this.phoneOtpService.sendOtp({
      target: dto.phone,
      purpose: 'REGISTER_ACCOUNT',
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      throw new BadRequestException(result.message ?? 'Failed to send OTP');
    }

    return {
      maskedPhone: result.maskedTarget,
      expiresInSeconds: result.expiresInSeconds,
    };
  }

  // ─── Step 2: Complete registration with OTP + profile data ────
  async register(
    dto: CustomerRegisterDto,
    deviceInfo: DeviceInfo,
  ): Promise<AuthResult> {
    // Verify the OTP (consume it so it can't be reused)
    const otpResult = await this.phoneOtpService.verifyOtp({
      target: dto.phone,
      purpose: 'REGISTER_ACCOUNT',
      code: dto.otpCode,
      consume: true,
    });

    if (!otpResult.success) {
      throw new UnauthorizedException(
        otpResult.message ?? AUTH_ERROR.OTP_INVALID,
      );
    }

    // Check for conflicts
    const existingPhone = await this.prisma.customer.findFirst({
      where: { phone: dto.phone, isGuest: false, deletedAt: null },
    });
    if (existingPhone) {
      throw new ConflictException(AUTH_ERROR.CUSTOMER_PHONE_TAKEN);
    }

    if (dto.email) {
      const existingEmail = await this.prisma.customer.findFirst({
        where: { email: dto.email.toLowerCase(), deletedAt: null },
      });
      if (existingEmail) {
        throw new ConflictException(AUTH_ERROR.CUSTOMER_EMAIL_TAKEN);
      }
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      AUTH_CONFIG.BCRYPT_ROUNDS,
    );

    // Check if a guest account with this phone already exists
    const guestAccount = await this.prisma.customer.findFirst({
      where: { phone: dto.phone, isGuest: true, deletedAt: null },
      select: { id: true },
    });

    let customer: { id: string };

    if (guestAccount) {
      // Upgrade the guest account to a full account
      customer = await this.prisma.customer.update({
        where: { id: guestAccount.id },
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          email: dto.email?.toLowerCase() ?? null,
          password: hashedPassword,
          isGuest: false,
          phoneVerified: true,
          isActive: true,
          updatedAt: new Date(),
        },
        select: { id: true },
      });
    } else {
      // Create new customer account
      customer = await this.prisma.customer.create({
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phone: dto.phone,
          email: dto.email?.toLowerCase() ?? null,
          password: hashedPassword,
          isGuest: false,
          phoneVerified: true,
          isActive: true,
        },
        select: { id: true },
      });
    }

    this.logger.log(`Customer registered: ${dto.phone}`);

    return this.tokenService.loginAndIssueTokens(
      'CUSTOMER',
      customer.id,
      deviceInfo,
    );
  }

  // ─── Login with Password ──────────────────────────────────────
  async loginWithPassword(
    dto: CustomerPasswordLoginDto,
    deviceInfo: DeviceInfo,
  ): Promise<AuthResult> {
    const customer = await this.prisma.customer.findFirst({
      where: { phone: dto.phone, deletedAt: null },
      select: {
        id: true,
        password: true,
        isActive: true,
        isGuest: true,
        phoneVerified: true,
        loginAttempts: true,
        lockedUntil: true,
      },
    });

    if (!customer) {
      throw new UnauthorizedException(AUTH_ERROR.INVALID_CREDENTIALS);
    }

    // Account locked?
    if (customer.lockedUntil && customer.lockedUntil > new Date()) {
      throw new UnauthorizedException(AUTH_ERROR.ACCOUNT_LOCKED);
    }

    // Account disabled?
    if (!customer.isActive) {
      throw new UnauthorizedException(AUTH_ERROR.ACCOUNT_DISABLED);
    }

    // Guest accounts can't login with password
    if (customer.isGuest || !customer.password) {
      throw new UnauthorizedException(AUTH_ERROR.CUSTOMER_IS_GUEST);
    }

    // Password check
    const valid = await bcrypt.compare(dto.password, customer.password);
    if (!valid) {
      await this.incrementLoginAttempts(customer.id);
      throw new UnauthorizedException(AUTH_ERROR.INVALID_CREDENTIALS);
    }

    // Reset attempts on success
    await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: deviceInfo.ipAddress ?? null,
      },
    });

    return this.tokenService.loginAndIssueTokens(
      'CUSTOMER',
      customer.id,
      deviceInfo,
    );
  }

  // ─── Request OTP for OTP-based login ─────────────────────────
  async requestLoginOtp(
    dto: CustomerRequestOtpDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ maskedPhone: string; expiresInSeconds: number }> {
    const customer = await this.prisma.customer.findFirst({
      where: { phone: dto.phone, isGuest: false, deletedAt: null },
      select: { id: true, isActive: true },
    });

    // Don't reveal if account doesn't exist
    if (!customer || !customer.isActive) {
      // Still send "success" to prevent enumeration
      return { maskedPhone: this.maskPhone(dto.phone), expiresInSeconds: 300 };
    }

    const result = await this.phoneOtpService.sendOtp({
      target: dto.phone,
      purpose: 'LOGIN_OTP',
      ipAddress,
      userAgent,
    });

    return {
      maskedPhone: result.maskedTarget,
      expiresInSeconds: result.expiresInSeconds,
    };
  }

  // ─── Login with OTP ───────────────────────────────────────────
  async loginWithOtp(
    dto: CustomerOtpLoginDto,
    deviceInfo: DeviceInfo,
  ): Promise<AuthResult> {
    const otpResult = await this.phoneOtpService.verifyOtp({
      target: dto.phone,
      purpose: 'LOGIN_OTP',
      code: dto.code,
      consume: true,
    });

    if (!otpResult.success) {
      throw new UnauthorizedException(
        otpResult.message ?? AUTH_ERROR.OTP_INVALID,
      );
    }

    const customer = await this.prisma.customer.findFirst({
      where: { phone: dto.phone, isGuest: false, deletedAt: null },
      select: { id: true, isActive: true },
    });

    if (!customer || !customer.isActive) {
      throw new UnauthorizedException(AUTH_ERROR.CUSTOMER_NOT_FOUND);
    }

    await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: deviceInfo.ipAddress ?? null,
      },
    });

    return this.tokenService.loginAndIssueTokens(
      'CUSTOMER',
      customer.id,
      deviceInfo,
    );
  }

  // ─── Forgot Password: Request OTP ────────────────────────────
  async requestPasswordReset(
    dto: ForgotPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ maskedPhone: string; expiresInSeconds: number }> {
    const customer = await this.prisma.customer.findFirst({
      where: { phone: dto.phone, isGuest: false, deletedAt: null },
      select: { id: true },
    });

    // Don't reveal if account doesn't exist (prevent enumeration)
    if (!customer) {
      return { maskedPhone: this.maskPhone(dto.phone), expiresInSeconds: 300 };
    }

    const result = await this.phoneOtpService.sendOtp({
      target: dto.phone,
      purpose: 'RESET_PASSWORD',
      ipAddress,
      userAgent,
    });

    return {
      maskedPhone: result.maskedTarget,
      expiresInSeconds: result.expiresInSeconds,
    };
  }

  // ─── Reset Password ────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const otpResult = await this.phoneOtpService.verifyOtp({
      target: dto.phone,
      purpose: 'RESET_PASSWORD',
      code: dto.code,
      consume: true,
    });

    if (!otpResult.success) {
      throw new UnauthorizedException(
        otpResult.message ?? AUTH_ERROR.OTP_INVALID,
      );
    }

    const customer = await this.prisma.customer.findFirst({
      where: { phone: dto.phone, isGuest: false, deletedAt: null },
      select: { id: true },
    });

    if (!customer) {
      throw new NotFoundException(AUTH_ERROR.CUSTOMER_NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      AUTH_CONFIG.BCRYPT_ROUNDS,
    );

    await this.prisma.customer.update({
      where: { id: customer.id },
      data: { password: hashedPassword },
    });

    // Revoke all existing sessions (force re-login on all devices)
    await this.tokenService.revokeAllOwnerTokens(
      'CUSTOMER',
      customer.id,
      'PASSWORD_RESET',
    );

    this.logger.log(`Password reset for customer: ${dto.phone}`);
  }

  // ─── Get Customer Profile ─────────────────────────────────────
  async getCustomerProfile(customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        phoneVerified: true,
        email: true,
        emailVerified: true,
        isGuest: true,
        isActive: true,
        avatar: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!customer) throw new NotFoundException(AUTH_ERROR.CUSTOMER_NOT_FOUND);
    return customer;
  }

  // ─── Private helpers ──────────────────────────────────────────
  private async incrementLoginAttempts(customerId: string): Promise<void> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { loginAttempts: true },
    });

    const newAttempts = (customer?.loginAttempts ?? 0) + 1;
    const shouldLock = newAttempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS;

    await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        loginAttempts: newAttempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + AUTH_CONFIG.LOCK_DURATION_MS)
          : undefined,
      },
    });

    if (shouldLock) {
      this.logger.warn(
        `Customer ${customerId} locked after ${newAttempts} failed attempts`,
      );
    }
  }

  private maskPhone(phone: string): string {
    if (phone.length < 7) return '****';
    return `${phone.substring(0, 4)}****${phone.substring(phone.length - 3)}`;
  }
}
