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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTypeGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const user_type_decorator_1 = require("../decorators/user-type.decorator");
const public_decorator_1 = require("../decorators/public.decorator");
const auth_constants_1 = require("../../auth/auth.constants");
let UserTypeGuard = class UserTypeGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const allowedTypes = this.reflector.getAllAndOverride(user_type_decorator_1.USER_TYPE_KEY, [context.getHandler(), context.getClass()]);
        if (!allowedTypes || allowedTypes.length === 0)
            return true;
        const user = context.switchToHttp().getRequest().user;
        if (!user || !allowedTypes.includes(user.type)) {
            throw new common_1.ForbiddenException(auth_constants_1.AUTH_ERROR.UNAUTHORIZED);
        }
        return true;
    }
};
exports.UserTypeGuard = UserTypeGuard;
exports.UserTypeGuard = UserTypeGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], UserTypeGuard);
//# sourceMappingURL=user-type.guard.js.map