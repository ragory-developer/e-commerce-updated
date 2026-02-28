export declare const OTP_CONFIG: {
    readonly CODE_LENGTH: 6;
    readonly EXPIRY_SECONDS: {
        readonly VERIFY_PHONE: number;
        readonly VERIFY_EMAIL: number;
        readonly RESET_PASSWORD: number;
        readonly LOGIN_OTP: number;
        readonly REGISTER_ACCOUNT: number;
    };
    readonly MAX_ATTEMPTS: 5;
    readonly LOCK_MINUTES: 15;
    readonly RATE_LIMIT: {
        readonly MAX_PER_HOUR: 5;
        readonly MAX_PER_DAY: 20;
        readonly WINDOW_MS: number;
    };
    readonly RESEND_COOLDOWN_SECONDS: 60;
};
export declare const OTP_ERROR: {
    readonly NOT_FOUND: "OTP not found or already used";
    readonly EXPIRED: "OTP has expired. Please request a new one";
    readonly MAX_ATTEMPTS: "Too many incorrect attempts. Please request a new OTP";
    readonly INVALID: "Invalid OTP code";
    readonly RATE_LIMIT: "Too many OTP requests. Please try again later";
    readonly COOLDOWN: "Please wait 60 seconds before requesting a new OTP";
};
