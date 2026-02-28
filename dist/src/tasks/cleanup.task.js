"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CleanupTask_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupTask = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const token_service_1 = require("../auth/token.service");
const otp_service_1 = require("../otp/otp.service");
let CleanupTask = CleanupTask_1 = class CleanupTask {
    tokenService;
    otpService;
    logger = new common_1.Logger(CleanupTask_1.name);
    constructor(tokenService, otpService) {
        this.tokenService = tokenService;
        this.otpService = otpService;
    }
    async cleanupExpiredTokens() {
        this.logger.log('Running token cleanup...');
        const count = await this.tokenService.cleanupExpiredTokens();
        this.logger.log(`Cleaned ${count} expired tokens`);
    }
    async cleanupExpiredOtps() {
        const count = await this.otpService.cleanupExpiredOtps();
        if (count > 0) {
            this.logger.log(`Cleaned ${count} expired OTPs`);
        }
    }
};
exports.CleanupTask = CleanupTask;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CleanupTask.prototype, "cleanupExpiredTokens", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CleanupTask.prototype, "cleanupExpiredOtps", null);
exports.CleanupTask = CleanupTask = CleanupTask_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [token_service_1.TokenService,
        otp_service_1.OtpService])
], CleanupTask);
//# sourceMappingURL=cleanup.task.js.map