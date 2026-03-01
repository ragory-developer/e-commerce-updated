import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  const logger = new Logger('Bootstrap');
  // const port = process.env.PORT || 3000;
  const nodeEnv = process.env.NODE_ENV || 'development';

  // ✅ Fix for Railway proxy
  // app.set('trust proxy', 1);

  // app.use(
  //   helmet({
  //     crossOriginResourcePolicy: false,
  //   }),
  // );

  // Configure CORS carefully (see section below)
  // app.enableCors({
  //   origin: [
  //     process.env.FRONTEND_URL || 'http://localhost:3000',
  //     'https://e-commerce-updated-production.up.railway.app',
  //     'https://ragory.tech',
  //   ],
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   credentials: true,
  // });

  app.enableCors();

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  if (nodeEnv !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('E-commerce API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // await app.listen(port);

  // Use Railway provided PORT (important)
  const port = Number(process.env.PORT) || 8080;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Running on the port ${port}`);
  logger.log(`🚀 Running on the port ${port}`);
}

bootstrap().catch((err) => {
  console.error('❌ Application do start', err);
  process.exit(1);
});
