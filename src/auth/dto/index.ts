// ─── src/auth/dto/index.ts ────────────────────────────────────

import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsArray,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdminRole, AdminPermission } from '@prisma/client';
import { Transform } from 'class-transformer';

// ─────────────────────────────────────────────────────────────
// ADMIN DTOs
// ─────────────────────────────────────────────────────────────

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-...' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  deviceId?: string;

  @ApiPropertyOptional({ example: 'Chrome on macOS' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  deviceName?: string;

  @ApiPropertyOptional({
    example: 'desktop',
    enum: ['mobile', 'tablet', 'desktop'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  deviceType?: string;
}

export class CreateAdminDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  lastName!: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @ApiPropertyOptional({ example: '+8801700000000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: 'SecureP@ss123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiPropertyOptional({ enum: AdminRole, default: AdminRole.ADMIN })
  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;

  @ApiPropertyOptional({ enum: AdminPermission, isArray: true, default: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(AdminPermission, { each: true })
  permissions?: AdminPermission[];
}

export class UpdateAdminPermissionsDto {
  @ApiPropertyOptional({
    enum: AdminPermission,
    isArray: true,
    description: 'Permission to ADD to main',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AdminPermission, { each: true })
  add?: AdminPermission[];

  @ApiPropertyOptional({
    enum: AdminPermission,
    isArray: true,
    description: 'Permission to REMOVE from main',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AdminPermission, { each: true })
  remove?: AdminPermission[];

  @ApiPropertyOptional({
    enum: AdminPermission,
    isArray: true,
    description: 'Permission to REPLACE main with',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AdminPermission, { each: true })
  replace?: AdminPermission[];
}

export class UpdateAdminRoleDto {
  @ApiProperty({ enum: AdminRole })
  @IsEnum(AdminRole)
  role!: AdminRole;
}

// ─────────────────────────────────────────────────────────────
// CUSTOMER DTOs
// ─────────────────────────────────────────────────────────────

export class CustomerRequestOtpDto {
  @ApiProperty({
    example: '01700000000',
    description: 'Bangladesh phone number',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  phone!: string;
}

export class CustomerVerifyOtpDto {
  @ApiProperty({ example: '01700000000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  phone!: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' })
  code!: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-...' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  deviceId?: string;

  @ApiPropertyOptional({ example: 'Samsung Galaxy S24' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  deviceName?: string;

  @ApiPropertyOptional({
    example: 'mobile',
    enum: ['mobile', 'tablet', 'desktop'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  deviceType?: string;
}

export class CustomerRegisterDto {
  @ApiProperty({ example: '01700000000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  phone!: string;

  @ApiProperty({ example: '123456', description: 'OTP code from SMS' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' })
  otpCode!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  lastName!: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiProperty({ example: 'SecureP@ss123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-...' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  deviceId?: string;

  @ApiPropertyOptional({ example: 'iPhone 15 Pro' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  deviceName?: string;

  @ApiPropertyOptional({
    example: 'mobile',
    enum: ['mobile', 'tablet', 'desktop'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  deviceType?: string;

  // Add these optional address fields to CustomerRegisterDto (after the password field):

  @ApiPropertyOptional({
    description: 'Optional: save a default address during registration',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RegisterAddressDto)
  address?: RegisterAddressDto;
}
// Add this import at the top:
import { ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// Add this class before CustomerRegisterDto:
export class RegisterAddressDto {
  @ApiPropertyOptional({ example: 'Home' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  label?: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  address!: string;

  @ApiPropertyOptional({ example: 'Near the park' })
  @IsOptional()
  @IsString()
  descriptions?: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  city!: string;

  @ApiProperty({ example: 'Dhaka Division' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  state!: string;

  @ApiPropertyOptional({ example: 'Road 5' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  road?: string;

  @ApiProperty({ example: '1207' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  zip!: string;

  @ApiProperty({ example: 'BD' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  country!: string;
}
export class CustomerPasswordLoginDto {
  @ApiProperty({ example: '01700000000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  phone!: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(191)
  deviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(191)
  deviceName?: string;

  @ApiPropertyOptional({ enum: ['mobile', 'tablet', 'desktop'] })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  deviceType?: string;
}

export class CustomerOtpLoginDto {
  @ApiProperty({ example: '01700000000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  phone!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' })
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(191)
  deviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(191)
  deviceName?: string;

  @ApiPropertyOptional({ enum: ['mobile', 'tablet', 'desktop'] })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  deviceType?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: '01700000000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  phone!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: '01700000000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  phone!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' })
  code!: string;

  @ApiProperty({ example: 'NewSecureP@ss123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword!: string;
}

// ─────────────────────────────────────────────────────────────
// SHARED DTOs
// ─────────────────────────────────────────────────────────────

export class RefreshTokenDto {
  @ApiProperty({ description: 'The refresh token received during login' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(191)
  deviceId?: string;
}

export class LogoutDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldP@ss123' })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ example: 'NewP@ss123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword!: string;
}

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;
}
