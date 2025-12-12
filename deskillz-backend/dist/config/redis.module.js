"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheTTL = exports.RedisKeys = exports.RedisModule = exports.REDIS_CLIENT = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
exports.REDIS_CLIENT = 'REDIS_CLIENT';
let RedisModule = class RedisModule {
    constructor(configService) {
        this.configService = configService;
    }
    onModuleDestroy() {
    }
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: exports.REDIS_CLIENT,
                useFactory: (configService) => {
                    const redis = new ioredis_1.default({
                        host: configService.get('redis.host', 'localhost'),
                        port: configService.get('redis.port', 6379),
                        password: configService.get('redis.password') || undefined,
                        retryStrategy: (times) => {
                            const delay = Math.min(times * 50, 2000);
                            return delay;
                        },
                        maxRetriesPerRequest: 3,
                    });
                    redis.on('connect', () => {
                        console.log('✅ Redis connected');
                    });
                    redis.on('error', (err) => {
                        console.error('❌ Redis error:', err.message);
                    });
                    return redis;
                },
                inject: [config_1.ConfigService],
            },
        ],
        exports: [exports.REDIS_CLIENT],
    }),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisModule);
exports.RedisKeys = {
    session: (userId) => `session:${userId}`,
    refreshToken: (token) => `refresh:${token}`,
    user: (userId) => `user:${userId}`,
    userByWallet: (address) => `user:wallet:${address.toLowerCase()}`,
    game: (gameId) => `game:${gameId}`,
    gamesList: (filters) => `games:list:${filters}`,
    tournament: (tournamentId) => `tournament:${tournamentId}`,
    tournamentPlayers: (tournamentId) => `tournament:${tournamentId}:players`,
    tournamentLeaderboard: (tournamentId) => `tournament:${tournamentId}:leaderboard`,
    matchmakingQueue: (gameId, mode) => `matchmaking:${gameId}:${mode}`,
    matchmakingUser: (userId) => `matchmaking:user:${userId}`,
    leaderboardGlobal: (period) => `leaderboard:global:${period}`,
    leaderboardGame: (gameId, period) => `leaderboard:game:${gameId}:${period}`,
    rateLimit: (key) => `ratelimit:${key}`,
    socketUser: (userId) => `socket:user:${userId}`,
    socketRoom: (room) => `socket:room:${room}`,
    siweNonce: (nonce) => `siwe:nonce:${nonce}`,
    lock: (resource) => `lock:${resource}`,
};
exports.CacheTTL = {
    SHORT: 60,
    MEDIUM: 300,
    LONG: 3600,
    DAY: 86400,
    WEEK: 604800,
    USER: 300,
    GAME: 600,
    TOURNAMENT: 60,
    LEADERBOARD: 300,
    SESSION: 86400 * 7,
    REFRESH_TOKEN: 86400 * 30,
    SIWE_NONCE: 300,
};
//# sourceMappingURL=redis.module.js.map