"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP_ERROR = exports.OTP_CONFIG = void 0;
exports.OTP_CONFIG = {
    CODE_LENGTH: 6,
    EXPIRY_SECONDS: {
        VERIFY_PHONE: 5 * 60,
        VERIFY_EMAIL: 5 * 60,
        RESET_PASSWORD: 5 * 60,
        LOGIN_OTP: 5 * 60,
        REGISTER_ACCOUNT: 5 * 60,
    },
    MAX_ATTEMPTS: 5,
    LOCK_MINUTES: 15,
    RATE_LIMIT: {
        MAX_PER_HOUR: 5,
        MAX_PER_DAY: 20,
        WINDOW_MS: 60 * 60 * 1000,
    },
    RESEND_COOLDOWN_SECONDS: 60,
};
exports.OTP_ERROR = {
    NOT_FOUND: 'OTP not found or already used',
    EXPIRED: 'OTP has expired. Please request a new one',
    MAX_ATTEMPTS: 'Too many incorrect attempts. Please request a new OTP',
    INVALID: 'Invalid OTP code',
    RATE_LIMIT: 'Too many OTP requests. Please try again later',
    COOLDOWN: `Please wait ${exports.OTP_CONFIG.RESEND_COOLDOWN_SECONDS} seconds before requesting a new OTP`,
};
//# sourceMappingURL=otp.constants.js.map