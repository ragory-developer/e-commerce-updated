"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGISTRATION_TOKEN_EXPIRES_MS = exports.REGISTRATION_TOKEN_EXPIRES_IN = exports.JWT_PAYLOAD_VERSION = exports.AUTH_ERROR = exports.AUTH_CONFIG = void 0;
exports.AUTH_CONFIG = {
    ACCESS_TOKEN_EXPIRES_IN: 15 * 60 * 1000,
    REFRESH_TOKEN_EXPIRES_IN: 7,
    REFRESH_TOKEN_EXPIRES_MS: 7 * 24 * 60 * 60 * 1000,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCK_DURATION_MIN: 15,
    LOCK_DURATION_MS: 15 * 60 * 1000,
    BCRYPT_ROUNDS: 12,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL ?? '',
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD ?? '',
    SUPER_ADMIN_FIRST_NAME: process.env.SUPER_ADMIN_FIRST_NAME ?? 'Super',
    SUPER_ADMIN_LAST_NAME: process.env.SUPER_ADMIN_LAST_NAME ?? 'Admin',
};
exports.AUTH_ERROR = {
    INVALID_CREDENTIALS: 'Invalid credentials',
    ACCOUNT_DISABLED: 'Account is disabled',
    ACCOUNT_LOCKED: 'Account is temporarily locked due to too many failed login attempts',
    TOKEN_INVALID: 'Token is invalid or expired',
    TOKEN_REVOKED: 'Token has been revoked',
    REFRESH_TOKEN_REUSE: 'Security alert: refresh token reuse detected. All sessions revoked',
    UNAUTHORIZED: 'Unauthorized',
    ADMIN_NOT_FOUND: 'Admin not found',
    ADMIN_EMAIL_TAKEN: 'Email is already registered',
    ADMIN_INSUFFICIENT_ROLE: 'Insufficient role to perform this action',
    CUSTOMER_NOT_FOUND: 'Customer not found',
    CUSTOMER_PHONE_TAKEN: 'Phone number is already registered',
    CUSTOMER_EMAIL_TAKEN: 'Email is already registered',
    CUSTOMER_NOT_VERIFIED: 'Phone number is not verified',
    CUSTOMER_IS_GUEST: 'Please complete registration before logging in with password',
    OTP_REQUIRED: 'OTP verification is required',
    OTP_INVALID: 'Invalid OTP code',
    OTP_REGISTRATION_TOKEN_INVALID: 'Registration token is invalid or expired. Please restart registration.',
};
exports.JWT_PAYLOAD_VERSION = 1;
exports.REGISTRATION_TOKEN_EXPIRES_IN = '15m';
exports.REGISTRATION_TOKEN_EXPIRES_MS = 15 * 60 * 1000;
//# sourceMappingURL=auth.constants.js.map