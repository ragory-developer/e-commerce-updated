// ─── src/main.ts ──────────────────────────────────────────────

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AdminAuthService } from './auth/admin-auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3001;
  const nodeEnv = configService.get<string>('nodeEnv') ?? 'development';
  const logger = new Logger('Bootstrap');

  // ─── Security ─────────────────────────────────────────────────
  app.use(helmet());

  app.enableCors({
    origin: nodeEnv === 'production' ? ['https://yourfrontend.com'] : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Device-Id'],
  });

  // ─── Global Prefix ────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── Validation ───────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Swagger (dev + explicitly enabled) ───────────────────────
  const enableSwagger =
    nodeEnv !== 'production' || process.env.ENABLE_SWAGGER === 'true';

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('E-commerce API')
      .setDescription(
        'Multi-platform e-commerce backend. ' +
          'Use /api/v1/auth/admin/login or /api/v1/auth/customer/login/* to get a token.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`📘 Swagger UI: http://localhost:${port}/api/docs`);
  }

  // ─── Seed Super Admin ──────────────────────────────────────────
  try {
    const adminAuthService = app.get(AdminAuthService);
    await adminAuthService.seedSuperAdmin();
  } catch (err) {
    logger.warn('Super admin seed skipped or failed: ' + err?.message);
  }

  // ─── Start ────────────────────────────────────────────────────
  await app.listen(port);
  logger.log(`🚀 Running: http://localhost:${port}/api/v1`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
}

bootstrap();
