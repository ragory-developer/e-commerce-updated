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
exports.LogoutDto = exports.RefreshTokenDto = exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.VerifyPhoneConfirmDto = exports.VerifyPhoneRequestDto = exports.CustomerOtpLoginVerifyDto = exports.CustomerOtpLoginRequestDto = exports.CustomerPasswordLoginDto = exports.CustomerCompleteRegistrationDto = exports.RegisterAddressDto = exports.CustomerVerifyRegistrationOtpDto = exports.CustomerRequestOtpDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CustomerRequestOtpDto {
    phone;
}
exports.CustomerRequestOtpDto = CustomerRequestOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '01700000000',
        description: 'Bangladesh phone number',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(20),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CustomerRequestOtpDto.prototype, "phone", void 0);
class CustomerVerifyRegistrationOtpDto {
    phone;
    code;
}
exports.CustomerVerifyRegistrationOtpDto = CustomerVerifyRegistrationOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01700000000' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(20),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CustomerVerifyRegistrationOtpDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456', description: '6-digit OTP code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' }),
    __metadata("design:type", String)
], CustomerVerifyRegistrationOtpDto.prototype, "code", void 0);
class RegisterAddressDto {
    label;
    address;
    descriptions;
    city;
    state;
    road;
    zip;
    country;
}
exports.RegisterAddressDto = RegisterAddressDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Home' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], RegisterAddressDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 Main St' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], RegisterAddressDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Near the park' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterAddressDto.prototype, "descriptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Dhaka' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], RegisterAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Dhaka Division' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], RegisterAddressDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Road 5' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], RegisterAddressDto.prototype, "road", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1207' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], RegisterAddressDto.prototype, "zip", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BD' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(50),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim().toUpperCase()),
    __metadata("design:type", String)
], RegisterAddressDto.prototype, "country", void 0);
class CustomerCompleteRegistrationDto {
    registrationToken;
    firstName;
    lastName;
    email;
    password;
    address;
    deviceId;
    deviceName;
    deviceType;
}
exports.CustomerCompleteRegistrationDto = CustomerCompleteRegistrationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Short-lived registration token received after OTP verification',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CustomerCompleteRegistrationDto.prototype, "registrationToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CustomerCompleteRegistrationDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CustomerCompleteRegistrationDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'john@example.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase().trim()),
    __metadata("design:type", String)
], CustomerCompleteRegistrationDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SecureP@ss123', minLength: 8 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(72),
    __metadata("design:type", String)
], CustomerCompleteRegistrationDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional: save a default address during registration',
        type: RegisterAddressDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RegisterAddressDto),
    __metadata("design:type", RegisterAddressDto)
], CustomerCompleteRegistrationDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'a1b2c3d4-e5f6-...' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], CustomerCompleteRegistrationDto.prototype, "deviceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'iPhone 15 Pro' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], CustomerCompleteRegistrationDto.prototype, "deviceName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'mobile',
        enum: ['mobile', 'tablet', 'desktop'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CustomerCompleteRegistrationDto.prototype, "deviceType", void 0);
class CustomerPasswordLoginDto {
    phone;
    password;
    deviceId;
    deviceName;
    deviceType;
}
exports.CustomerPasswordLoginDto = CustomerPasswordLoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01700000000' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(20),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CustomerPasswordLoginDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SecureP@ss123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], CustomerPasswordLoginDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], CustomerPasswordLoginDto.prototype, "deviceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], CustomerPasswordLoginDto.prototype, "deviceName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['mobile', 'tablet', 'desktop'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CustomerPasswordLoginDto.prototype, "deviceType", void 0);
class CustomerOtpLoginRequestDto {
    phone;
}
exports.CustomerOtpLoginRequestDto = CustomerOtpLoginRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01700000000' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(20),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CustomerOtpLoginRequestDto.prototype, "phone", void 0);
class CustomerOtpLoginVerifyDto {
    phone;
    code;
    deviceId;
    deviceName;
    deviceType;
}
exports.CustomerOtpLoginVerifyDto = CustomerOtpLoginVerifyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01700000000' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(20),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CustomerOtpLoginVerifyDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' }),
    __metadata("design:type", String)
], CustomerOtpLoginVerifyDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], CustomerOtpLoginVerifyDto.prototype, "deviceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], CustomerOtpLoginVerifyDto.prototype, "deviceName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['mobile', 'tablet', 'desktop'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CustomerOtpLoginVerifyDto.prototype, "deviceType", void 0);
class VerifyPhoneRequestDto {
    phone;
}
exports.VerifyPhoneRequestDto = VerifyPhoneRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01700000000' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(20),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], VerifyPhoneRequestDto.prototype, "phone", void 0);
class VerifyPhoneConfirmDto {
    phone;
    code;
}
exports.VerifyPhoneConfirmDto = VerifyPhoneConfirmDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01700000000' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(20),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], VerifyPhoneConfirmDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' }),
    __metadata("design:type", String)
], VerifyPhoneConfirmDto.prototype, "code", void 0);
class ForgotPasswordDto {
    phone;
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01700000000' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(20),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "phone", void 0);
class ResetPasswordDto {
    phone;
    code;
    newPassword;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01700000000' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(20),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NewSecureP@ss123', minLength: 8 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(72),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
class RefreshTokenDto {
    refreshToken;
    deviceId;
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The refresh token received during login' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "deviceId", void 0);
class LogoutDto {
    refreshToken;
}
exports.LogoutDto = LogoutDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LogoutDto.prototype, "refreshToken", void 0);
//# sourceMappingURL=customer-auth.dto.js.map