// ─── src/auth/auth.controller.ts ─────────────────────────────

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

import { AdminAuthService } from './admin-auth.service';
import { CustomerAuthService } from './customer-auth.service';
import { TokenService } from './token.service';

import {
  AdminLoginDto,
  CreateAdminDto,
  UpdateAdminPermissionsDto,
  UpdateAdminRoleDto,
  CustomerRequestOtpDto,
  CustomerRegisterDto,
  CustomerPasswordLoginDto,
  CustomerOtpLoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
  LogoutDto,
} from './dto';

import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserType } from '../common/decorators/user-type.decorator';
import { RequestUser } from './auth.types';
import { AdminRole } from '@prisma/client';

// ─── Helper: extract device info from request ─────────────────
function extractDeviceInfo(req: Request, body: any) {
  return {
    clientDeviceId: body.deviceId ?? generateFallbackDeviceId(req),
    deviceName: body.deviceName,
    deviceType: body.deviceType,
    ipAddress:
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      undefined,
    userAgent: req.headers['user-agent'] ?? undefined,
  };
}

function generateFallbackDeviceId(req: Request): string {
  // Deterministic fallback based on userAgent + IP
  const ua = req.headers['user-agent'] ?? '';
  const ip = req.socket.remoteAddress ?? '';
  const raw = `${ua}:${ip}`;
  // Simple hash (not cryptographic, just for stable ID)
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) + hash + raw.charCodeAt(i);
    hash = hash & hash;
  }
  return `fallback-${Math.abs(hash).toString(16)}`;
}

// ─────────────────────────────────────────────────────────────

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly customerAuthService: CustomerAuthService,
    private readonly tokenService: TokenService,
  ) {}

  // ===========================================================
  // ADMIN AUTH
  // ===========================================================

  @Public()
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login with email + password' })
  async adminLogin(@Body() dto: AdminLoginDto, @Req() req: Request) {
    const deviceInfo = extractDeviceInfo(req, dto);
    const result = await this.adminAuthService.login(dto, deviceInfo);

    return {
      message: 'Login successful',
      data: {
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresIn: result.tokens.expiresIn,
      },
    };
  }

  @ApiBearerAuth('access-token')
  @Roles(AdminRole.SUPERADMIN)
  @Post('admin/create')
  @ApiOperation({ summary: 'Create a new admin (SUPERADMIN only)' })
  async createAdmin(
    @Body() dto: CreateAdminDto,
    @CurrentUser() user: RequestUser,
  ) {
    const admin = await this.adminAuthService.createAdmin(
      dto,
      user.id,
      user.role!,
    );
    return {
      message: 'Admin created successfully',
      data: admin,
    };
  }

  @ApiBearerAuth('access-token')
  @Roles(AdminRole.SUPERADMIN)
  @Get('admin/list')
  @ApiOperation({ summary: 'List all admins (SUPERADMIN only)' })
  async listAdmins(@CurrentUser() user: RequestUser) {
    const admins = await this.adminAuthService.listAdmins(user.role!);
    return {
      message: 'Admins retrieved',
      data: admins,
    };
  }

  @ApiBearerAuth('access-token')
  @Roles(AdminRole.SUPERADMIN)
  @Patch('admin/:id/permissions')
  @ApiOperation({ summary: 'Update admin permissions (SUPERADMIN only)' })
  async updateAdminPermissions(
    @Param('id') id: string,
    @Body() dto: UpdateAdminPermissionsDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.adminAuthService.updatePermissions(id, dto, user.role!);
    return { message: 'Permissions updated', data: null };
  }

  @ApiBearerAuth('access-token')
  @Roles(AdminRole.SUPERADMIN)
  @Patch('admin/:id/role')
  @ApiOperation({ summary: 'Update admin role (SUPERADMIN only)' })
  async updateAdminRole(
    @Param('id') id: string,
    @Body() dto: UpdateAdminRoleDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.adminAuthService.updateRole(id, dto, user.role!);
    return { message: 'Role updated', data: null };
  }

  @ApiBearerAuth('access-token')
  @Roles(AdminRole.SUPERADMIN)
  @Patch('admin/:id/disable')
  @ApiOperation({ summary: 'Disable an admin account (SUPERADMIN only)' })
  async disableAdmin(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    await this.adminAuthService.setActiveStatus(id, false, user.role!, user.id);
    return { message: 'Admin disabled', data: null };
  }

  @ApiBearerAuth('access-token')
  @Roles(AdminRole.SUPERADMIN)
  @Patch('admin/:id/enable')
  @ApiOperation({ summary: 'Enable an admin account (SUPERADMIN only)' })
  async enableAdmin(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    await this.adminAuthService.setActiveStatus(id, true, user.role!, user.id);
    return { message: 'Admin enabled', data: null };
  }

  @ApiBearerAuth('access-token')
  @Roles(AdminRole.SUPERADMIN)
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete an admin (SUPERADMIN only)' })
  async deleteAdmin(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    await this.adminAuthService.deleteAdmin(id, user.role!, user.id);
    return { message: 'Admin deleted', data: null };
  }

  // ===========================================================
  // CUSTOMER AUTH
  // ===========================================================

  @Public()
  @Post('customer/otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP for registration (step 1)' })
  async requestRegistrationOtp(
    @Body() dto: CustomerRequestOtpDto,
    @Req() req: Request,
  ) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress;
    const ua = req.headers['user-agent'];
    const result = await this.customerAuthService.requestRegistrationOtp(
      dto,
      ip,
      ua,
    );
    return {
      message: `OTP sent to ${result.maskedPhone}`,
      data: result,
    };
  }

  @Public()
  @Post('customer/register')
  @ApiOperation({
    summary: 'Complete registration with OTP + profile (step 2)',
  })
  async register(@Body() dto: CustomerRegisterDto, @Req() req: Request) {
    const deviceInfo = extractDeviceInfo(req, dto);
    const result = await this.customerAuthService.register(dto, deviceInfo);

    return {
      message: 'Registration successful',
      data: {
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresIn: result.tokens.expiresIn,
      },
    };
  }

  @Public()
  @Post('customer/login/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer login with phone + password' })
  async customerPasswordLogin(
    @Body() dto: CustomerPasswordLoginDto,
    @Req() req: Request,
  ) {
    const deviceInfo = extractDeviceInfo(req, dto);
    const result = await this.customerAuthService.loginWithPassword(
      dto,
      deviceInfo,
    );

    return {
      message: 'Login successful',
      data: {
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresIn: result.tokens.expiresIn,
      },
    };
  }

  @Public()
  @Post('customer/login/otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP for OTP-based login' })
  async requestLoginOtp(
    @Body() dto: CustomerRequestOtpDto,
    @Req() req: Request,
  ) {
    const ip = req.socket.remoteAddress;
    const ua = req.headers['user-agent'];
    const result = await this.customerAuthService.requestLoginOtp(dto, ip, ua);
    return {
      message: `OTP sent to ${result.maskedPhone}`,
      data: result,
    };
  }

  @Public()
  @Post('customer/login/otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and login' })
  async customerOtpLogin(
    @Body() dto: CustomerOtpLoginDto,
    @Req() req: Request,
  ) {
    const deviceInfo = extractDeviceInfo(req, dto);
    const result = await this.customerAuthService.loginWithOtp(dto, deviceInfo);

    return {
      message: 'Login successful',
      data: {
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresIn: result.tokens.expiresIn,
      },
    };
  }

  @Public()
  @Post('customer/password/forgot')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset OTP' })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    const ip = req.socket.remoteAddress;
    const ua = req.headers['user-agent'];
    const result = await this.customerAuthService.requestPasswordReset(
      dto,
      ip,
      ua,
    );
    return {
      message: `Reset OTP sent to ${result.maskedPhone}`,
      data: result,
    };
  }

  @Public()
  @Post('customer/password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with OTP' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.customerAuthService.resetPassword(dto);
    return { message: 'Password reset successfully', data: null };
  }

  // ===========================================================
  // SHARED ENDPOINTS (Admin + Customer)
  // ===========================================================

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate refresh token and get new token pair',
    description:
      'Send the refresh token. Old token is revoked, new pair is issued.',
  })
  async refresh(@Body() dto: RefreshTokenDto) {
    const { tokens } = await this.tokenService.rotateRefreshToken(
      dto.refreshToken,
      dto.deviceId,
    );

    return {
      message: 'Token refreshed',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    };
  }

  @ApiBearerAuth('access-token')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout from this device (revoke current refresh token)',
  })
  async logout(@Body() dto: LogoutDto, @CurrentUser() user: RequestUser) {
    await this.tokenService.revokeToken(dto.refreshToken);
    // Also deactivate the current device
    await this.tokenService.revokeDeviceTokens(user.deviceId, 'LOGOUT');
    return { message: 'Logged out successfully', data: null };
  }

  @ApiBearerAuth('access-token')
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from all devices' })
  async logoutAll(@CurrentUser() user: RequestUser) {
    await this.tokenService.revokeAllOwnerTokens(
      user.type,
      user.id,
      'ALL_DEVICES',
    );
    return { message: 'Logged out from all devices', data: null };
  }

  @ApiBearerAuth('access-token')
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async getMe(@CurrentUser() user: RequestUser) {
    if (user.type === 'ADMIN') {
      const profile = await this.adminAuthService.getAdminProfile(user.id);
      return {
        message: 'Profile retrieved',
        data: { ...profile, userType: 'ADMIN' },
      };
    } else {
      const profile = await this.customerAuthService.getCustomerProfile(
        user.id,
      );
      return {
        message: 'Profile retrieved',
        data: { ...profile, userType: 'CUSTOMER' },
      };
    }
  }

  @ApiBearerAuth('access-token')
  @Get('devices')
  @ApiOperation({ summary: 'List all active devices for current user' })
  async getDevices(@CurrentUser() user: RequestUser) {
    const ownerWhere =
      user.type === 'ADMIN' ? { adminId: user.id } : { customerId: user.id };

    const devices = await this.tokenService['prisma'].device.findMany({
      where: { ...ownerWhere, isActive: true },
      select: {
        id: true,
        deviceId: true,
        deviceName: true,
        deviceType: true,
        ipAddress: true,
        lastActiveAt: true,
        createdAt: true,
      },
      orderBy: { lastActiveAt: 'desc' },
    });

    return { message: 'Devices retrieved', data: devices };
  }

  @ApiBearerAuth('access-token')
  @Delete('devices/:deviceDbId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout a specific device by its DB ID' })
  async revokeDevice(
    @Param('deviceDbId') deviceDbId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const ownerWhere =
      user.type === 'ADMIN' ? { adminId: user.id } : { customerId: user.id };

    // Verify the device belongs to the caller
    const device = await this.tokenService['prisma'].device.findFirst({
      where: { id: deviceDbId, ...ownerWhere },
    });

    if (!device) {
      return { message: 'Device not found', data: null };
    }

    await this.tokenService.revokeDeviceTokens(deviceDbId, 'DEVICE_LOGOUT');
    return { message: 'Device logged out', data: null };
  }
}
