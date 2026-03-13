// ─── src/auth/customer-auth.service.ts ───────────────────────
// Responsibility: Customer AUTHENTICATION only.
// Profile management → customer.service.ts

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
  CustomerCompleteRegistrationDto,
  CustomerPasswordLoginDto,
  CustomerOtpLoginVerifyDto,
  CustomerOtpLoginRequestDto,
  CustomerRequestOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyPhoneRequestDto,
  VerifyPhoneConfirmDto,
} from './dto';
import { DeviceInfo, AuthResult } from './auth.types';
import { AUTH_CONFIG, AUTH_ERROR } from './auth.constants';
import { maskPhone } from '../common/helpers/mask.helper';
import { PasswordValidator } from './auth.validators';

@Injectable()
export class CustomerAuthService {
  private readonly logger = new Logger(CustomerAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly phoneOtpService: PhoneOtpService,
    private readonly tokenService: TokenService,
  ) {}

  // ══════════════════════════════════════════════════════════════
  // REGISTRATION — 3-STEP FLOW
  // ══════════════════════════════════════════════════════════════

  // ─── Step 1: Request OTP ──────────────────────────────────────
  async requestRegistrationOtp(
    dto: CustomerRequestOtpDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ maskedPhone: string; expiresInSeconds: number }> {
    const existing = await this.prisma.customer.findFirst({
      where: { phone: dto.phone, deletedAt: null },
      select: { id: true, isGuest: true },
    });

    if (existing && !existing.isGuest) {
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

  // ─── Step 2: Verify OTP → registration token ──────────────────
  async verifyRegistrationOtp(
    phone: string,
    code: string,
  ): Promise<{ registrationToken: string; maskedPhone: string }> {
    const otpResult = await this.phoneOtpService.verifyOtp({
      target: phone,
      purpose: 'REGISTER_ACCOUNT',
      code,
      consume: true,
    });

    if (!otpResult.success) {
      throw new UnauthorizedException(
        otpResult.message ?? AUTH_ERROR.OTP_INVALID,
      );
    }

    const registrationToken =
      this.tokenService.generateRegistrationToken(phone);

    return {
      registrationToken,
      maskedPhone: maskPhone(phone),
    };
  }

  // ─── Step 3: Complete Registration ────────────────────────────
  async completeRegistration(
    dto: CustomerCompleteRegistrationDto,
    deviceInfo: DeviceInfo,
  ): Promise<AuthResult> {
    const tokenPayload = this.tokenService.verifyRegistrationToken(
      dto.registrationToken,
    );

    const phone = tokenPayload.sub;

    const existingPhone = await this.prisma.customer.findFirst({
      where: { phone, isGuest: false, deletedAt: null },
    });

    if (existingPhone)
      throw new ConflictException(AUTH_ERROR.CUSTOMER_PHONE_TAKEN);

    if (dto.email) {
      const existingEmail = await this.prisma.customer.findFirst({
        where: { email: dto.email.toLowerCase(), deletedAt: null },
      });

      if (existingEmail)
        throw new ConflictException(AUTH_ERROR.CUSTOMER_EMAIL_TAKEN);
    }

    // Validate password strength
    PasswordValidator.validate(dto.password);

    const hashedPassword = await bcrypt.hash(
      dto.password,
      AUTH_CONFIG.BCRYPT_ROUNDS,
    );

    const guestAccount = await this.prisma.customer.findFirst({
      where: { phone, isGuest: true, deletedAt: null },
      select: { id: true },
    });

    let customerId: string;

    if (guestAccount) {
      const updated = await this.prisma.customer.update({
        where: { id: guestAccount.id },
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          email: dto.email?.toLowerCase() ?? null,
          password: hashedPassword,
          isGuest: false,
          phoneVerified: true,
          isActive: true,
        },
        select: { id: true },
      });

      customerId = updated.id;
    } else {
      const created = await this.prisma.customer.create({
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phone,
          email: dto.email?.toLowerCase() ?? null,
          password: hashedPassword,
          isGuest: false,
          phoneVerified: true,
          isActive: true,
        },
        select: { id: true },
      });

      customerId = created.id;
    }

    if (dto.address) {
      await this.prisma.address.create({
        data: {
          customerId,
          label: dto.address.label ?? 'Home',
          address: dto.address.address,
          descriptions: dto.address.descriptions ?? '',
          city: dto.address.city,
          state: dto.address.state,
          road: dto.address.road ?? '',
          zip: dto.address.zip,
          country: dto.address.country,
          isDefault: true,
          createdBy: customerId,
        },
      });
    }

    this.logger.log(`Customer registered: ${phone}`);

    return this.tokenService.loginAndIssueTokens(
      'CUSTOMER',
      customerId,
      deviceInfo,
    );
  }

  // ══════════════════════════════════════════════════════════════
  // LOGIN
  // ══════════════════════════════════════════════════════════════

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

    if (!customer)
      throw new UnauthorizedException(AUTH_ERROR.INVALID_CREDENTIALS);

    if (customer.lockedUntil && customer.lockedUntil > new Date()) {
      throw new UnauthorizedException(AUTH_ERROR.ACCOUNT_LOCKED);
    }

    if (!customer.isActive)
      throw new UnauthorizedException(AUTH_ERROR.ACCOUNT_DISABLED);

    if (customer.isGuest || !customer.password) {
      throw new UnauthorizedException(AUTH_ERROR.CUSTOMER_IS_GUEST);
    }

    // Prevent timing attacks
    const dummyHash =
      '$2b$12$KbQiF2Xk5b9VYy8Ej3Z9UeZ5gVxF5D1ZxJHGtJwQ1xExampleDummyHash';

    const hashToCompare = customer?.password ?? dummyHash;

    const valid = await bcrypt.compare(dto.password, hashToCompare);

    if (!customer || !valid) {
      if (customer) {
        await this.incrementLoginAttempts(customer.id);
      }

      throw new UnauthorizedException(AUTH_ERROR.INVALID_CREDENTIALS);
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

  // ─── OTP Login Request ────────────────────────────────────────
  async requestLoginOtp(
    dto: CustomerOtpLoginRequestDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ maskedPhone: string; expiresInSeconds: number }> {
    const customer = await this.prisma.customer.findFirst({
      where: { phone: dto.phone, isGuest: false, deletedAt: null },
      select: { id: true, isActive: true },
    });

    if (!customer || !customer.isActive) {
      return { maskedPhone: maskPhone(dto.phone), expiresInSeconds: 300 };
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

  async loginWithOtp(
    dto: CustomerOtpLoginVerifyDto,
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

  // ══════════════════════════════════════════════════════════════
  // CHANGE PASSWORD
  // ══════════════════════════════════════════════════════════════

  async changePassword(
    customerId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    PasswordValidator.validate(newPassword);

    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
      select: { password: true },
    });

    if (!customer) {
      throw new UnauthorizedException(AUTH_ERROR.CUSTOMER_NOT_FOUND);
    }

    const valid = await bcrypt.compare(currentPassword, customer.password);

    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      AUTH_CONFIG.BCRYPT_ROUNDS,
    );

    await this.prisma.customer.update({
      where: { id: customerId },
      data: { password: hashedPassword },
    });

    await this.tokenService.revokeAllOwnerTokens(
      'CUSTOMER',
      customerId,
      'All_DEVICES',
    );

    this.logger.log(`[AUTH] Password changed for customer ${customerId}`);
  }

  // ══════════════════════════════════════════════════════════════
  // PASSWORD RESET
  // ══════════════════════════════════════════════════════════════

  async requestPasswordReset(
    dto: ForgotPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ maskedPhone: string; expiresInSeconds: number }> {
    const customer = await this.prisma.customer.findFirst({
      where: { phone: dto.phone, isGuest: false, deletedAt: null },
      select: { id: true },
    });

    if (!customer) {
      return { maskedPhone: maskPhone(dto.phone), expiresInSeconds: 300 };
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

    if (!customer) throw new NotFoundException(AUTH_ERROR.CUSTOMER_NOT_FOUND);

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      AUTH_CONFIG.BCRYPT_ROUNDS,
    );

    await this.prisma.customer.update({
      where: { id: customer.id },
      data: { password: hashedPassword },
    });

    await this.tokenService.revokeAllOwnerTokens(
      'CUSTOMER',
      customer.id,
      'All_DEVICES',
    );

    this.logger.log(`Password reset for customer: ${dto.phone}`);
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
}
