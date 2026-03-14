/**
 * src/otp/otp.service.ts
 *
 * Core OTP service - handles generation, storage, verification, and rate limiting.
 */

import { Injectable, Logger } from '@nestjs/common';
import { OtpChannel, OtpPurpose } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { OTP_CONFIG, OTP_ERROR } from './otp.constants';
import {
  SendOtpOptions,
  VerifyOtpOptions,
  VerifyOtpResult,
  RateLimitCheck,
} from './otp.types';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Generate Secure Random OTP Code ─────────────────────────
  generateCode(): string {
    const min = Math.pow(10, OTP_CONFIG.CODE_LENGTH - 1);
    const max = Math.pow(10, OTP_CONFIG.CODE_LENGTH);

    return crypto.randomInt(min, max).toString();
  }

  // ─── Hash OTP Code (bcrypt for security) ─────────────────────
  async hashCode(code: string): Promise<string> {
    return await bcrypt.hash(code, 10);
  }

  // ─── Compare OTP Code (timing-safe) ──────────────────────────
  async compareCode(code: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(code, hash);
  }

  // ─── Mask Target (Privacy Protection) ────────────────────────
  maskTarget(target: string, channel: OtpChannel): string {
    if (channel === 'EMAIL') {
      const [local, domain] = target.split('@');

      if (!local || !domain) return '***@***';

      const visibleLocal = local.length > 2 ? local.substring(0, 2) : local[0];

      return `${visibleLocal}****@${domain}`;
    } else {
      // SMS
      if (target.length < 7) return '****';

      const start = target.substring(0, 4);
      const end = target.substring(target.length - 3);

      return `${start}****${end}`;
    }
  }

  // ─── Rate Limit Check ────────────────────────────────────────
  async checkRateLimit(
    target: string,
    purpose: OtpPurpose,
  ): Promise<RateLimitCheck> {
    const windowStart = new Date(Date.now() - OTP_CONFIG.RATE_LIMIT.WINDOW_MS);

    const count = await this.prisma.verificationOtp.count({
      where: {
        target,
        purpose,
        createdAt: { gte: windowStart },
      },
    });

    if (count >= OTP_CONFIG.RATE_LIMIT.MAX_PER_HOUR) {
      return {
        allowed: false,
        count,
        resetAt: new Date(
          windowStart.getTime() + OTP_CONFIG.RATE_LIMIT.WINDOW_MS,
        ),
      };
    }

    return { allowed: true, count };
  }

  // ─── Abuse Protection (24h block if too many OTPs) ───────────
  async checkDailyAbuse(target: string, purpose: OtpPurpose): Promise<boolean> {
    const count = await this.prisma.verificationOtp.count({
      where: {
        target,
        purpose,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    return count >= OTP_CONFIG.MAX_ATTEMPTS * 3;
  }

  // ─── Check Resend Cooldown ───────────────────────────────────
  async checkResendCooldown(
    target: string,
    purpose: OtpPurpose,
  ): Promise<boolean> {
    const cooldownEnd = new Date(
      Date.now() - OTP_CONFIG.RESEND_COOLDOWN_SECONDS * 1000,
    );

    const recent = await this.prisma.verificationOtp.findFirst({
      where: {
        target,
        purpose,
        createdAt: { gte: cooldownEnd },
      },
      orderBy: { createdAt: 'desc' },
    });

    return !!recent;
  }

  // ─── Store OTP ───────────────────────────────────────────────
  // In storeOtp method, use upsert instead of create:
  async storeOtp(
    channel: OtpChannel,
    options: SendOtpOptions,
    codeHash: string,
  ): Promise<void> {
    const expirySeconds = OTP_CONFIG.EXPIRY_SECONDS[options.purpose];
    const expiresAt = new Date(Date.now() + expirySeconds * 1000);

    // ✅ Invalidate previous OTPs first
    await this.prisma.verificationOtp.updateMany({
      where: {
        target: options.target,
        purpose: options.purpose,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      data: {
        expiresAt: new Date(), // ✅ Expire immediately
      },
    });

    // ✅ Create new OTP
    await this.prisma.verificationOtp.create({
      data: {
        channel,
        purpose: options.purpose,
        target: options.target,
        codeHash,
        expiresAt,
        attempts: 0,
        maxAttempts: OTP_CONFIG.MAX_ATTEMPTS,
        verified: false,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
      },
    });

    this.logger.log(
      `OTP stored for ${this.maskTarget(options.target, channel)} (${options.purpose})`,
    );
  }

  // ─── Verify OTP ──────────────────────────────────────────────
  async verifyOtp(options: VerifyOtpOptions): Promise<VerifyOtpResult> {
    const otp = await this.prisma.verificationOtp.findFirst({
      where: {
        target: options.target,
        purpose: options.purpose,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      return { success: false, message: OTP_ERROR.NOT_FOUND };
    }

    if (otp.expiresAt < new Date()) {
      return { success: false, message: OTP_ERROR.EXPIRED };
    }

    if (otp.attempts >= otp.maxAttempts) {
      return { success: false, message: OTP_ERROR.MAX_ATTEMPTS };
    }

    const isValid = await this.compareCode(options.code, otp.codeHash);

    if (!isValid) {
      // ✅ Use atomic increment
      const updated = await this.prisma.verificationOtp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
        select: { attempts: true, maxAttempts: true },
      });

      if (updated.attempts >= updated.maxAttempts) {
        return { success: false, message: OTP_ERROR.MAX_ATTEMPTS };
      }

      return { success: false, message: OTP_ERROR.INVALID };
    }

    if (options.consume) {
      await this.prisma.verificationOtp.update({
        where: { id: otp.id },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
      });
    }

    this.logger.log(
      `OTP verified for ${this.maskTarget(options.target, otp.channel)} (${options.purpose})`,
    );

    return { success: true, verified: true };
  }

  // ─── Cleanup Expired OTPs (Cron Job) ─────────────────────────
  async cleanupExpiredOtps(): Promise<number> {
    const result = await this.prisma.verificationOtp.deleteMany({
      where: {
        OR: [
          {
            verified: true,
            verifiedAt: {
              lt: new Date(Date.now() - 86400000),
            },
          },
          {
            expiresAt: { lt: new Date() },
          },
        ],
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired OTP records`);

    return result.count;
  }
}
