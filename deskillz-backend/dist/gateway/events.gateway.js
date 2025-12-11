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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EventsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
const redis_module_1 = require("../config/redis.module");
const prisma_service_1 = require("../prisma/prisma.service");
let EventsGateway = EventsGateway_1 = class EventsGateway {
    constructor(jwtService, configService, prisma, redis) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.prisma = prisma;
        this.redis = redis;
        this.logger = new common_1.Logger(EventsGateway_1.name);
    }
    afterInit(server) {
        this.logger.log('🔌 WebSocket Gateway initialized');
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '');
            if (!token) {
                this.logger.warn(`Client ${client.id} connected without auth`);
                client.emit('error', { message: 'Authentication required' });
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('jwt.secret'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: { id: true, username: true, status: true },
            });
            if (!user || user.status !== 'ACTIVE') {
                client.emit('error', { message: 'Invalid user' });
                client.disconnect();
                return;
            }
            client.userId = user.id;
            client.username = user.username;
            await this.redis.set(redis_module_1.RedisKeys.socketUser(user.id), client.id, 'EX', 86400);
            client.join(`user:${user.id}`);
            this.logger.log(`✅ User ${user.username} connected (${client.id})`);
            client.emit('connected', {
                userId: user.id,
                username: user.username,
                socketId: client.id,
            });
        }
        catch (error) {
            this.logger.error(`Connection error: ${error.message}`);
            client.emit('error', { message: 'Authentication failed' });
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        if (client.userId) {
            await this.redis.del(redis_module_1.RedisKeys.socketUser(client.userId));
            await this.removeFromMatchmaking(client.userId);
            this.logger.log(`User ${client.username} disconnected (${client.id})`);
        }
    }
    async handleJoinMatchmaking(client, data) {
        if (!client.userId) {
            return { error: 'Not authenticated' };
        }
        const { gameId, mode, entryFee, currency } = data;
        const game = await this.prisma.game.findUnique({
            where: { id: gameId },
            select: { id: true, name: true, minPlayers: true, maxPlayers: true },
        });
        if (!game) {
            return { error: 'Game not found' };
        }
        const queueKey = redis_module_1.RedisKeys.matchmakingQueue(gameId, mode);
        const userEntry = JSON.stringify({
            userId: client.userId,
            username: client.username,
            joinedAt: Date.now(),
            entryFee,
            currency,
        });
        await this.redis.zadd(queueKey, Date.now(), userEntry);
        await this.redis.set(redis_module_1.RedisKeys.matchmakingUser(client.userId), queueKey, 'EX', 3600);
        client.join(`matchmaking:${gameId}:${mode}`);
        this.logger.log(`User ${client.username} joined matchmaking for ${game.name} (${mode})`);
        await this.tryMatchPlayers(gameId, mode, game.minPlayers);
        return { success: true, message: 'Joined matchmaking queue' };
    }
    async handleLeaveMatchmaking(client) {
        if (!client.userId) {
            return { error: 'Not authenticated' };
        }
        await this.removeFromMatchmaking(client.userId);
        return { success: true, message: 'Left matchmaking queue' };
    }
    async removeFromMatchmaking(userId) {
        const queueKey = await this.redis.get(redis_module_1.RedisKeys.matchmakingUser(userId));
        if (queueKey) {
            const entries = await this.redis.zrange(queueKey, 0, -1);
            for (const entry of entries) {
                const parsed = JSON.parse(entry);
                if (parsed.userId === userId) {
                    await this.redis.zrem(queueKey, entry);
                    break;
                }
            }
            await this.redis.del(redis_module_1.RedisKeys.matchmakingUser(userId));
        }
    }
    async tryMatchPlayers(gameId, mode, minPlayers) {
        const queueKey = redis_module_1.RedisKeys.matchmakingQueue(gameId, mode);
        const entries = await this.redis.zrange(queueKey, 0, minPlayers - 1);
        if (entries.length >= minPlayers) {
            const players = entries.map((e) => JSON.parse(e));
            const matchId = `match_${Date.now()}`;
            const matchData = {
                matchId,
                tournamentId: '',
                players: players.map((p) => ({
                    userId: p.userId,
                    username: p.username,
                })),
                gameId,
                startTime: new Date(Date.now() + 10000),
            };
            for (const entry of entries) {
                await this.redis.zrem(queueKey, entry);
                const player = JSON.parse(entry);
                await this.redis.del(redis_module_1.RedisKeys.matchmakingUser(player.userId));
            }
            for (const player of players) {
                this.server.to(`user:${player.userId}`).emit('match:found', matchData);
            }
            const matchRoom = `match:${matchId}`;
            for (const player of players) {
                const socketId = await this.redis.get(redis_module_1.RedisKeys.socketUser(player.userId));
                if (socketId) {
                    const socket = this.server.sockets.sockets.get(socketId);
                    socket?.join(matchRoom);
                }
            }
            this.logger.log(`Match created: ${matchId} with ${players.length} players`);
        }
    }
    async handleJoinTournamentRoom(client, data) {
        if (!client.userId) {
            return { error: 'Not authenticated' };
        }
        client.join(`tournament:${data.tournamentId}`);
        return { success: true };
    }
    async handleLeaveTournamentRoom(client, data) {
        client.leave(`tournament:${data.tournamentId}`);
        return { success: true };
    }
    async handleGameAction(client, data) {
        if (!client.userId) {
            return { error: 'Not authenticated' };
        }
        this.server.to(`match:${data.matchId}`).emit('game:action', {
            userId: client.userId,
            username: client.username,
            action: data.action,
            payload: data.payload,
            timestamp: Date.now(),
        });
        return { success: true };
    }
    async handleGameScore(client, data) {
        if (!client.userId) {
            return { error: 'Not authenticated' };
        }
        this.server.to(`match:${data.matchId}`).emit('game:score_update', {
            userId: client.userId,
            username: client.username,
            score: data.score,
            timestamp: Date.now(),
        });
        return { success: true };
    }
    async sendToUser(userId, event, data) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
    async broadcastToTournament(tournamentId, event, data) {
        this.server.to(`tournament:${tournamentId}`).emit(event, data);
    }
    async broadcastToMatch(matchId, event, data) {
        this.server.to(`match:${matchId}`).emit(event, data);
    }
    async broadcastAll(event, data) {
        this.server.emit(event, data);
    }
    async getOnlineCount() {
        const sockets = await this.server.fetchSockets();
        return sockets.length;
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('matchmaking:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleJoinMatchmaking", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('matchmaking:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleLeaveMatchmaking", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('tournament:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleJoinTournamentRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('tournament:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleLeaveTournamentRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('game:action'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleGameAction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('game:score'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleGameScore", null);
exports.EventsGateway = EventsGateway = EventsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGINS?.split(',') || [
                'http://localhost:3000',
                'https://deskillz.games',
            ],
            credentials: true,
        },
        namespace: '/',
        transports: ['websocket', 'polling'],
    }),
    __param(3, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService,
        ioredis_1.default])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map