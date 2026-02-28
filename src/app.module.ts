// ─── src/app.module.ts ───────────────────────────────────────

import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module';
import { OtpModule } from './otp/otp.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CustomerModule } from './customer/customer.module';
import { AddressModule } from './address/address.module';
import { TasksModule } from './tasks/tasks.module';

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
import { MediaController } from './media/media.controller';
import { MediaService } from './media/media.service';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    // ─── Configuration ────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: { abortEarly: true },
    }),

    // ─── Rate Limiting ─────────────────────────────────────────────
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 5 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),

    // ─── Core Infrastructure ───────────────────────────────────────
    PrismaModule,
    OtpModule,
    TasksModule,

    // ─── Feature Modules ───────────────────────────────────────────
    // Auth must come before Admin/Customer (they import AuthModule for TokenService)
    AuthModule,
    AdminModule,
    CustomerModule,
    AddressModule,
    MediaModule,
  ],

  controllers: [AppController, MediaController],

  providers: [
    AppService,

    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },

    // Guard order matters:
    // 1. Rate limiter  → reject abuse first
    // 2. JWT auth      → validate token, populate req.user
    // 3. UserType      → ADMIN vs CUSTOMER
    // 4. Roles         → admin role check
    // 5. Permissions   → fine-grained permission check
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: UserTypeGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    MediaService,
  ],
})
export class AppModule {}
