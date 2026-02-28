"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.validationSchema = Joi.object({
    DATABASE_URL: Joi.string().uri().required(),
    JWT_SECRET: Joi.string().min(16).required(),
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().default(3001),
    ENABLE_SWAGGER: Joi.string().valid('true', 'false').default('false'),
    JWT_ACCESS_EXPIRES: Joi.string().default('15m'),
    JWT_REFRESH_EXPIRES: Joi.string().default('7d'),
    BCRYPT_ROUNDS: Joi.number().min(10).max(14).default(12),
    THROTTLE_TTL: Joi.number().default(60000),
    THROTTLE_LIMIT: Joi.number().default(100),
    SUPER_ADMIN_EMAIL: Joi.string().email().required(),
    SUPER_ADMIN_PASSWORD: Joi.string().min(8).required(),
    SUPER_ADMIN_FIRST_NAME: Joi.string().default('Super'),
    SUPER_ADMIN_LAST_NAME: Joi.string().default('Admin'),
    EMAIL_HOST: Joi.string().optional(),
    EMAIL_PORT: Joi.number().optional(),
    EMAIL_SECURE: Joi.boolean().optional(),
    EMAIL_USER: Joi.string().optional(),
    EMAIL_PASSWORD: Joi.string().optional(),
    EMAIL_FROM_NAME: Joi.string().default('Your Store'),
    EMAIL_FROM_ADDRESS: Joi.string().email().optional(),
    SMS_API_KEY: Joi.string().optional(),
    SMS_SENDER_ID: Joi.string().optional(),
    SMS_BASE_URL: Joi.string().uri().optional(),
});
//# sourceMappingURL=validation.schema.js.map