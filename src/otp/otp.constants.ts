/**
 * src/otp/otp.constants.ts
 *
 * Central constants for the OTP system.
 * One place to change — everywhere picks it up.
 */

export const OTP_CONFIG = {
  // OTP code length (number of digits)
  CODE_LENGTH: 6,

  // OTP code validity duration in seconds (e.g., 5 minutes)
  EXPIRY_SECONDS: {
    VERIFY_PHONE: 5 * 60,
    VERIFY_EMAIL: 5 * 60,
    RESET_PASSWORD: 5 * 60,
    LOGIN_OTP: 5 * 60,
    REGISTER_ACCOUNT: 5 * 60,
  },

  // max OTP attempts before lockout
  MAX_ATTEMPTS: 5,
  LOCK_MINUTES: 15,

  // rate limit for OTP requests (e.g., 5 per hour)
  RATE_LIMIT: {
    MAX_PER_HOUR: 5,
    MAX_PER_DAY: 20,
    WINDOW_MS: 60 * 60 * 1000, // 1 hour in milliseconds
  },

  // Cooldown between resend requests (seconds)
  RESEND_COOLDOWN_SECONDS: 60,
} as const;

export const OTP_ERROR = {
  NOT_FOUND: 'OTP not found or already used',
  EXPIRED: 'OTP has expired. Please request a new one',
  MAX_ATTEMPTS: 'Too many incorrect attempts. Please request a new OTP',
  INVALID: 'Invalid OTP code',
  RATE_LIMIT: 'Too many OTP requests. Please try again later',
  COOLDOWN: `Please wait ${OTP_CONFIG.RESEND_COOLDOWN_SECONDS} seconds before requesting a new OTP`,
} as const;
