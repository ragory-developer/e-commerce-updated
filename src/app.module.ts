// ─── src/app.module.ts ───────────────────────────────────────

import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module';
import { OtpModule } from './otp/otp.module';
import { AuthModule } from './auth/auth.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import configuration from './common/config/configuration';
import { validationSchema } from './common/config/validation.schema';

import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { UserTypeGuard } from './common/guards/user-type.guard';

@Module({
  imports: [
    // ─── Configuration ───────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: { abortEarly: true },
    }),

    // ─── Rate Limiting ────────────────────────────────────────────
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 5 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),

    // ─── Core Modules ─────────────────────────────────────────────
    PrismaModule,
    OtpModule,
    AuthModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,

    // ─── Global Exception Filter ──────────────────────────────────
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },

    // ─── Global Response Transformer ─────────────────────────────
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },

    // ─── Global Guards (order matters!) ──────────────────────────
    // 1. Rate Limiter  — reject abuse first
    // 2. JWT Auth      — validate token, populate req.user
    // 3. UserType      — check ADMIN vs CUSTOMER
    // 4. Roles         — check admin role
    // 5. Permissions   — check specific permissions
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UserTypeGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
