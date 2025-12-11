"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const bull_1 = require("@nestjs/bull");
const configuration_1 = require("./config/configuration");
const env_validation_1 = require("./config/env.validation");
const prisma_module_1 = require("./prisma/prisma.module");
const redis_module_1 = require("./config/redis.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const games_module_1 = require("./modules/games/games.module");
const tournaments_module_1 = require("./modules/tournaments/tournaments.module");
const wallet_module_1 = require("./modules/wallet/wallet.module");
const leaderboard_module_1 = require("./modules/leaderboard/leaderboard.module");
const developer_module_1 = require("./modules/developer/developer.module");
const ai_module_1 = require("./modules/ai/ai.module");
const events_gateway_1 = require("./gateway/events.gateway");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                validate: env_validation_1.validate,
                envFilePath: ['.env.local', '.env'],
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
                    limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
                },
            ]),
            bull_1.BullModule.forRoot({
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                    password: process.env.REDIS_PASSWORD || undefined,
                },
            }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            games_module_1.GamesModule,
            tournaments_module_1.TournamentsModule,
            wallet_module_1.WalletModule,
            leaderboard_module_1.LeaderboardModule,
            developer_module_1.DeveloperModule,
            ai_module_1.AIModule,
        ],
        providers: [events_gateway_1.EventsGateway],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map