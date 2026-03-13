// ─── src/auth/auth.constants.ts ──────────────────────────────

export const AUTH_CONFIG = {
  // ─── JWT ──────────────────────────────────────────────────────
  ACCESS_TOKEN_EXPIRES_IN: 15 * 60 * 1000, // 15 minutes in ms
  REFRESH_TOKEN_EXPIRES_IN: 7,
  REFRESH_TOKEN_EXPIRES_MS: 7 * 24 * 60 * 60 * 1000, // 7 days in ms

  // ─── Login Security ───────────────────────────────────────────
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_DURATION_MIN: 15, // minutes
  LOCK_DURATION_MS: 15 * 60 * 1000, // 15 minutes in ms

  // ─── Password ─────────────────────────────────────────────────
  BCRYPT_ROUNDS: 12,
  MIN_PASSWORD_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,

  // ─── Admin Seeding ────────────────────────────────────────────
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL ?? '',
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD ?? '',
  SUPER_ADMIN_FIRST_NAME: process.env.SUPER_ADMIN_FIRST_NAME ?? 'Super',
  SUPER_ADMIN_LAST_NAME: process.env.SUPER_ADMIN_LAST_NAME ?? 'Admin',

  // ─── Token Rotation ──────────────────────────────────────────
  ENABLE_TOKEN_ROTATION: true,
  TOKEN_FAMILY_TRACKING: true,
  REVOKE_ON_LOGOUT_ALL: true,
} as const;

export const AUTH_ERROR = {
  // ─── Generic ──────────────────────────────────────────────────
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_DISABLED: 'Account is disabled or deleted',
  ACCOUNT_LOCKED:
    'Account is temporarily locked due to too many failed login attempts. Try again in 15 minutes.',
  TOKEN_INVALID: 'Token is invalid or expired',
  TOKEN_REVOKED: 'Token has been revoked',
  TOKEN_REUSE_DETECTED:
    'Security alert: suspicious token activity detected. All sessions have been revoked for security.',
  REFRESH_TOKEN_REUSE:
    'Security alert: refresh token reuse detected. All sessions revoked. Please log in again.',
  UNAUTHORIZED: 'Unauthorized access',
  WEAK_PASSWORD:
    'Password must be at least 8 characters, include uppercase, numbers, and special characters',

  // ─── Admin ────────────────────────────────────────────────────
  ADMIN_NOT_FOUND: 'Admin account not found',
  ADMIN_EMAIL_TAKEN: 'Email address is already registered',
  ADMIN_INSUFFICIENT_ROLE: 'Insufficient permissions to perform this action',
  ADMIN_CANNOT_SELF_MODIFY: 'You cannot modify your own account settings',
  ADMIN_SUPERADMIN_PROTECTED: 'Cannot modify SUPERADMIN account',

  // ─── Customer ─────────────────────────────────────────────────
  CUSTOMER_NOT_FOUND: 'Customer account not found',
  CUSTOMER_EMAIL_TAKEN: 'Email address already registered',
  CUSTOMER_PHONE_TAKEN: 'Phone number already registered',
  CUSTOMER_NOT_VERIFIED: 'Customer email/phone not verified',

  // ─── OTP ──────────────────────────────────────────────────────
  OTP_INVALID: 'Invalid OTP code',
  OTP_EXPIRED: 'OTP has expired. Please request a new one.',
  OTP_MAX_ATTEMPTS_EXCEEDED:
    'Maximum OTP attempts exceeded. Please request a new one.',
  OTP_COOLDOWN_ACTIVE: 'Please wait before requesting a new OTP',
  OTP_REGISTRATION_TOKEN_INVALID: 'otp registration token invalid',

  // ─── Device ───────────────────────────────────────────────────
  DEVICE_NOT_FOUND: 'Device not found or revoked',
  DEVICE_REVOKED: 'Device session has been revoked',
} as const;

// JWT payload type identifier
export const JWT_PAYLOAD_VERSION = 1;
// Short-lived registration token: 15 minutes
export const REGISTRATION_TOKEN_EXPIRES_IN = '15m';
export const REGISTRATION_TOKEN_EXPIRES_MS = 15 * 60 * 1000;
