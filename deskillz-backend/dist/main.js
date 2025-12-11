"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1',
    });
    app.enableCors({
        origin: process.env.CORS_ORIGINS?.split(',') || [
            'http://localhost:3000',
            'https://deskillz.games',
            'https://www.deskillz.games',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Deskillz.games API')
            .setDescription('Web3 Competitive Gaming Platform API')
            .setVersion('1.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        }, 'JWT-auth')
            .addTag('Auth', 'Authentication endpoints')
            .addTag('Users', 'User management')
            .addTag('Games', 'Game discovery and management')
            .addTag('Tournaments', 'Tournament operations')
            .addTag('Wallet', 'Wallet and transactions')
            .addTag('Leaderboard', 'Rankings and statistics')
            .addTag('Developer', 'Developer portal')
            .addTag('Admin', 'Admin operations')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('docs', app, document);
    }
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎮  DESKILLZ.GAMES BACKEND SERVER                          ║
║                                                               ║
║   Server:     http://localhost:${port}                          ║
║   API:        http://localhost:${port}/api/v1                   ║
║   Swagger:    http://localhost:${port}/docs                     ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}
bootstrap();
//# sourceMappingURL=main.js.map