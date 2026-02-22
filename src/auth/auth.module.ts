// ─── src/auth/auth.module.ts ──────────────────────────────────

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module';
import { OtpModule } from '../otp/otp.module';

import { AuthController } from './auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { CustomerAuthService } from './customer-auth.service';
import { TokenService } from './token.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    OtpModule,

    // Passport with JWT as default strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JwtModule with async config (reads from ConfigService)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('jwt.secret'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [AdminAuthService, CustomerAuthService, TokenService, JwtStrategy],

  exports: [
    TokenService,
    AdminAuthService,
    CustomerAuthService,
    JwtStrategy,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
