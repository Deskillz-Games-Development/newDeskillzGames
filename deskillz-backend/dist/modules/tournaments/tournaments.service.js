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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentsService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const ioredis_1 = require("ioredis");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_module_1 = require("../../config/redis.module");
const client_1 = require("@prisma/client");
let TournamentsService = class TournamentsService {
    constructor(prisma, redis, tournamentQueue) {
        this.prisma = prisma;
        this.redis = redis;
        this.tournamentQueue = tournamentQueue;
    }
    async create(dto) {
        const game = await this.prisma.game.findUnique({
            where: { id: dto.gameId },
        });
        if (!game || game.status !== 'APPROVED') {
            throw new common_1.BadRequestException('Invalid or unapproved game');
        }
        if (dto.mode === client_1.TournamentMode.SYNC && !game.supportsSync) {
            throw new common_1.BadRequestException('Game does not support synchronous mode');
        }
        if (dto.mode === client_1.TournamentMode.ASYNC && !game.supportsAsync) {
            throw new common_1.BadRequestException('Game does not support asynchronous mode');
        }
        const tournament = await this.prisma.tournament.create({
            data: {
                gameId: dto.gameId,
                name: dto.name,
                description: dto.description,
                mode: dto.mode,
                entryFee: dto.entryFee,
                entryCurrency: dto.entryCurrency,
                prizePool: dto.prizePool,
                prizeCurrency: dto.prizeCurrency,
                minPlayers: dto.minPlayers || 2,
                maxPlayers: dto.maxPlayers,
                prizeDistribution: dto.prizeDistribution,
                scheduledStart: new Date(dto.scheduledStart),
                scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : null,
                matchDuration: dto.matchDuration,
                roundsCount: dto.roundsCount || 1,
                platformFeePercent: dto.platformFeePercent || 10,
                status: client_1.TournamentStatus.SCHEDULED,
            },
            include: {
                game: { select: { id: true, name: true, slug: true, iconUrl: true } },
                _count: { select: { entries: true } },
            },
        });
        await this.tournamentQueue.add('start-tournament', { tournamentId: tournament.id }, { delay: new Date(dto.scheduledStart).getTime() - Date.now() });
        return this.toTournamentResponse(tournament);
    }
    async findAll(query) {
        const { page = 1, limit = 20, status, mode, gameId, minEntryFee, maxEntryFee, currency, sortBy = 'scheduledStart', sortOrder = 'asc', } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (mode) {
            where.mode = mode;
        }
        if (gameId) {
            where.gameId = gameId;
        }
        if (minEntryFee !== undefined || maxEntryFee !== undefined) {
            where.entryFee = {};
            if (minEntryFee !== undefined)
                where.entryFee.gte = minEntryFee;
            if (maxEntryFee !== undefined)
                where.entryFee.lte = maxEntryFee;
        }
        if (currency) {
            where.entryCurrency = currency;
        }
        const [tournaments, total] = await Promise.all([
            this.prisma.tournament.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    game: { select: { id: true, name: true, slug: true, iconUrl: true } },
                    _count: { select: { entries: true } },
                },
            }),
            this.prisma.tournament.count({ where }),
        ]);
        return {
            tournaments: tournaments.map((t) => this.toTournamentResponse(t)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
        const cached = await this.redis.get(redis_module_1.RedisKeys.tournament(id));
        if (cached) {
            return JSON.parse(cached);
        }
        const tournament = await this.prisma.tournament.findUnique({
            where: { id },
            include: {
                game: { select: { id: true, name: true, slug: true, iconUrl: true } },
                _count: { select: { entries: true } },
            },
        });
        if (!tournament) {
            throw new common_1.NotFoundException('Tournament not found');
        }
        const response = this.toTournamentResponse(tournament);
        await this.redis.setex(redis_module_1.RedisKeys.tournament(id), redis_module_1.CacheTTL.TOURNAMENT, JSON.stringify(response));
        return response;
    }
    async join(tournamentId, userId, dto) {
        const tournament = await this.prisma.tournament.findUnique({
            where: { id: tournamentId },
            include: { _count: { select: { entries: true } } },
        });
        if (!tournament) {
            throw new common_1.NotFoundException('Tournament not found');
        }
        if (tournament.status !== client_1.TournamentStatus.SCHEDULED &&
            tournament.status !== client_1.TournamentStatus.OPEN) {
            throw new common_1.BadRequestException('Tournament is not accepting entries');
        }
        const existingEntry = await this.prisma.tournamentEntry.findUnique({
            where: {
                tournamentId_userId: { tournamentId, userId },
            },
        });
        if (existingEntry) {
            throw new common_1.BadRequestException('Already joined this tournament');
        }
        if (tournament._count.entries >= tournament.maxPlayers) {
            throw new common_1.BadRequestException('Tournament is full');
        }
        const entry = await this.prisma.tournamentEntry.create({
            data: {
                tournamentId,
                userId,
                entryAmount: tournament.entryFee,
                entryCurrency: tournament.entryCurrency,
                entryTxHash: dto.txHash,
                status: dto.txHash ? client_1.EntryStatus.CONFIRMED : client_1.EntryStatus.PENDING,
            },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            },
        });
        await this.prisma.tournament.update({
            where: { id: tournamentId },
            data: { currentPlayers: { increment: 1 } },
        });
        await this.redis.del(redis_module_1.RedisKeys.tournament(tournamentId));
        return this.toEntryResponse(entry);
    }
    async leave(tournamentId, userId) {
        const tournament = await this.prisma.tournament.findUnique({
            where: { id: tournamentId },
        });
        if (!tournament) {
            throw new common_1.NotFoundException('Tournament not found');
        }
        if (tournament.status !== client_1.TournamentStatus.SCHEDULED &&
            tournament.status !== client_1.TournamentStatus.OPEN) {
            throw new common_1.BadRequestException('Cannot leave an active tournament');
        }
        const entry = await this.prisma.tournamentEntry.findUnique({
            where: {
                tournamentId_userId: { tournamentId, userId },
            },
        });
        if (!entry) {
            throw new common_1.NotFoundException('Not enrolled in this tournament');
        }
        await this.prisma.tournamentEntry.update({
            where: { id: entry.id },
            data: { status: client_1.EntryStatus.REFUNDED },
        });
        await this.prisma.tournament.update({
            where: { id: tournamentId },
            data: { currentPlayers: { decrement: 1 } },
        });
        await this.tournamentQueue.add('process-refund', {
            entryId: entry.id,
            userId,
            amount: entry.entryAmount,
            currency: entry.entryCurrency,
        });
        await this.redis.del(redis_module_1.RedisKeys.tournament(tournamentId));
    }
    async submitScore(tournamentId, userId, dto) {
        const tournament = await this.prisma.tournament.findUnique({
            where: { id: tournamentId },
        });
        if (!tournament) {
            throw new common_1.NotFoundException('Tournament not found');
        }
        if (tournament.status !== client_1.TournamentStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Tournament is not in progress');
        }
        const entry = await this.prisma.tournamentEntry.findUnique({
            where: {
                tournamentId_userId: { tournamentId, userId },
            },
        });
        if (!entry || entry.status !== client_1.EntryStatus.PLAYING) {
            throw new common_1.ForbiddenException('Not authorized to submit score');
        }
        await this.prisma.gameScore.upsert({
            where: {
                id: `${tournamentId}-${userId}`,
            },
            create: {
                tournamentId,
                userId,
                gameId: tournament.gameId,
                score: dto.score,
                metadata: dto.metadata,
                signature: dto.signature,
                verified: false,
            },
            update: {
                score: dto.score,
                metadata: dto.metadata,
                signature: dto.signature,
            },
        });
        await this.prisma.tournamentEntry.update({
            where: { id: entry.id },
            data: {
                status: client_1.EntryStatus.COMPLETED,
                completedAt: new Date(),
            },
        });
        await this.redis.del(redis_module_1.RedisKeys.tournamentLeaderboard(tournamentId));
    }
    async getLeaderboard(tournamentId) {
        const cached = await this.redis.get(redis_module_1.RedisKeys.tournamentLeaderboard(tournamentId));
        if (cached) {
            return JSON.parse(cached);
        }
        const scores = await this.prisma.gameScore.findMany({
            where: { tournamentId },
            orderBy: { score: 'desc' },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            },
        });
        const leaderboard = scores.map((score, index) => ({
            rank: index + 1,
            userId: score.userId,
            username: score.user.username,
            displayName: score.user.displayName ?? undefined,
            avatarUrl: score.user.avatarUrl ?? undefined,
            score: score.score,
            submittedAt: score.submittedAt,
        }));
        await this.redis.setex(redis_module_1.RedisKeys.tournamentLeaderboard(tournamentId), redis_module_1.CacheTTL.SHORT, JSON.stringify(leaderboard));
        return leaderboard;
    }
    async getUserEntries(userId) {
        const entries = await this.prisma.tournamentEntry.findMany({
            where: { userId },
            include: {
                tournament: {
                    include: {
                        game: { select: { id: true, name: true, slug: true, iconUrl: true } },
                    },
                },
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            },
            orderBy: { joinedAt: 'desc' },
        });
        return entries.map((e) => this.toEntryResponse(e));
    }
    async getActiveByGame(gameId) {
        const tournaments = await this.prisma.tournament.findMany({
            where: {
                gameId,
                status: { in: [client_1.TournamentStatus.SCHEDULED, client_1.TournamentStatus.OPEN] },
            },
            orderBy: { scheduledStart: 'asc' },
            include: {
                game: { select: { id: true, name: true, slug: true, iconUrl: true } },
                _count: { select: { entries: true } },
            },
        });
        return tournaments.map((t) => this.toTournamentResponse(t));
    }
    toTournamentResponse(tournament) {
        return {
            id: tournament.id,
            gameId: tournament.gameId,
            game: tournament.game,
            name: tournament.name,
            description: tournament.description,
            mode: tournament.mode,
            entryFee: tournament.entryFee.toString(),
            entryCurrency: tournament.entryCurrency,
            prizePool: tournament.prizePool.toString(),
            prizeCurrency: tournament.prizeCurrency,
            minPlayers: tournament.minPlayers,
            maxPlayers: tournament.maxPlayers,
            currentPlayers: tournament.currentPlayers,
            prizeDistribution: tournament.prizeDistribution,
            scheduledStart: tournament.scheduledStart,
            scheduledEnd: tournament.scheduledEnd,
            actualStart: tournament.actualStart,
            actualEnd: tournament.actualEnd,
            matchDuration: tournament.matchDuration,
            roundsCount: tournament.roundsCount,
            status: tournament.status,
            platformFeePercent: parseFloat(tournament.platformFeePercent.toString()),
            entriesCount: tournament._count?.entries || 0,
            createdAt: tournament.createdAt,
        };
    }
    toEntryResponse(entry) {
        return {
            id: entry.id,
            tournamentId: entry.tournamentId,
            tournament: entry.tournament
                ? this.toTournamentResponse(entry.tournament)
                : undefined,
            userId: entry.userId,
            user: entry.user,
            entryAmount: entry.entryAmount.toString(),
            entryCurrency: entry.entryCurrency,
            entryTxHash: entry.entryTxHash,
            status: entry.status,
            finalRank: entry.finalRank,
            prizeWon: entry.prizeWon?.toString(),
            prizeTxHash: entry.prizeTxHash,
            joinedAt: entry.joinedAt,
            startedAt: entry.startedAt,
            completedAt: entry.completedAt,
        };
    }
};
exports.TournamentsService = TournamentsService;
exports.TournamentsService = TournamentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __param(2, (0, bull_1.InjectQueue)('tournaments')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ioredis_1.default, Object])
], TournamentsService);
//# sourceMappingURL=tournaments.service.js.map