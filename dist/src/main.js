"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const admin_auth_service_1 = require("./auth/admin-auth.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('port') ?? 3001;
    const nodeEnv = configService.get('nodeEnv') ?? 'development';
    const logger = new common_1.Logger('Bootstrap');
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: nodeEnv === 'production' ? ['https://yourfrontend.com'] : true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Device-Id'],
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const enableSwagger = nodeEnv !== 'production' || process.env.ENABLE_SWAGGER === 'true';
    if (enableSwagger) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('E-commerce API')
            .setDescription('Multi-platform e-commerce backend. ' +
            'Use /api/v1/auth/admin/login or /api/v1/auth/customer/login/* to get a token.')
            .setVersion('1.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'Authorization',
            in: 'header',
        }, 'access-token')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
        logger.log(`📘 Swagger UI: http://localhost:${port}/api/docs`);
    }
    try {
        const adminAuthService = app.get(admin_auth_service_1.AdminAuthService);
        await adminAuthService.seedSuperAdmin();
    }
    catch (err) {
        logger.warn('Super admin seed skipped or failed: ' + err?.message);
    }
    await app.listen(port);
    logger.log(`🚀 Running: http://localhost:${port}/api/v1`);
    logger.log(`🌍 Environment: ${nodeEnv}`);
}
bootstrap();
//# sourceMappingURL=main.js.map