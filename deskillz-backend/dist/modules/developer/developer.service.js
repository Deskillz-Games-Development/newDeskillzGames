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
exports.DeveloperService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const crypto = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_module_1 = require("../../config/redis.module");
let DeveloperService = class DeveloperService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async getDashboard(developerId) {
        const games = await this.prisma.game.findMany({
            where: { developerId },
            include: {
                _count: { select: { tournaments: true } },
            },
        });
        const gameIds = games.map((g) => g.id);
        const totalMatches = games.reduce((sum, g) => sum + g.totalMatches, 0);
        const totalRevenue = games.reduce((sum, g) => sum + parseFloat(g.totalRevenue.toString()), 0);
        const activeTournaments = await this.prisma.tournament.count({
            where: {
                gameId: { in: gameIds },
                status: { in: ['SCHEDULED', 'OPEN', 'IN_PROGRESS'] },
            },
        });
        const uniquePlayers = await this.prisma.tournamentEntry.findMany({
            where: {
                tournament: { gameId: { in: gameIds } },
            },
            distinct: ['userId'],
            select: { userId: true },
        });
        const pendingPayouts = await this.prisma.transaction.aggregate({
            where: {
                userId: developerId,
                type: 'DEVELOPER_PAYOUT',
                status: 'PENDING',
            },
            _sum: { amount: true },
        });
        const recentTournaments = await this.prisma.tournament.findMany({
            where: { gameId: { in: gameIds } },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                game: { select: { name: true } },
                _count: { select: { entries: true } },
            },
        });
        return {
            totalGames: games.length,
            approvedGames: games.filter((g) => g.status === 'APPROVED').length,
            pendingGames: games.filter((g) => g.status === 'PENDING_REVIEW').length,
            totalMatches,
            totalPlayers: uniquePlayers.length,
            totalRevenue: totalRevenue.toFixed(8),
            pendingPayouts: pendingPayouts._sum.amount?.toString() || '0',
            activeTournaments,
            games: games.map((g) => ({
                id: g.id,
                name: g.name,
                status: g.status,
                totalMatches: g.totalMatches,
                totalPlayers: g.totalPlayers,
                revenue: g.totalRevenue.toString(),
                tournamentsCount: g._count.tournaments,
            })),
            recentActivity: recentTournaments.map((t) => ({
                type: 'tournament',
                gameName: t.game.name,
                tournamentName: t.name,
                players: t._count.entries,
                status: t.status,
                createdAt: t.createdAt,
            })),
        };
    }
    async getGameAnalytics(developerId, gameId) {
        const game = await this.prisma.game.findUnique({
            where: { id: gameId },
        });
        if (!game) {
            throw new common_1.NotFoundException('Game not found');
        }
        if (game.developerId !== developerId) {
            throw new common_1.ForbiddenException('Not authorized to view this game');
        }
        const tournamentStats = await this.prisma.tournament.groupBy({
            by: ['status'],
            where: { gameId },
            _count: { _all: true },
        });
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dailyMatches = await this.prisma.gameScore.groupBy({
            by: ['submittedAt'],
            where: {
                gameId,
                submittedAt: { gte: thirtyDaysAgo },
            },
            _count: { _all: true },
        });
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const playersLast7Days = await this.prisma.tournamentEntry.findMany({
            where: {
                tournament: { gameId },
                joinedAt: { gte: sevenDaysAgo },
            },
            distinct: ['userId'],
        });
        const playersLast30Days = await this.prisma.tournamentEntry.findMany({
            where: {
                tournament: { gameId },
                joinedAt: { gte: thirtyDaysAgo },
            },
            distinct: ['userId'],
        });
        const avgScore = await this.prisma.gameScore.aggregate({
            where: { gameId },
            _avg: { score: true },
            _max: { score: true },
            _min: { score: true },
        });
        return {
            gameId: game.id,
            gameName: game.name,
            status: game.status,
            totalMatches: game.totalMatches,
            totalPlayers: game.totalPlayers,
            totalRevenue: game.totalRevenue.toString(),
            averageRating: parseFloat(game.avgRating.toString()),
            tournamentsByStatus: tournamentStats.reduce((acc, t) => ({ ...acc, [t.status]: t._count._all }), {}),
            playersLast7Days: playersLast7Days.length,
            playersLast30Days: playersLast30Days.length,
            retentionRate: playersLast30Days.length > 0
                ? Math.round((playersLast7Days.length / playersLast30Days.length) * 100)
                : 0,
            averageScore: avgScore._avg.score || 0,
            highestScore: avgScore._max.score || 0,
            lowestScore: avgScore._min.score || 0,
        };
    }
    async getRevenueReport(developerId, startDate, endDate) {
        const games = await this.prisma.game.findMany({
            where: { developerId },
            select: { id: true, name: true, revenueShare: true },
        });
        const gameIds = games.map((g) => g.id);
        const dateFilter = {};
        if (startDate)
            dateFilter.gte = startDate;
        if (endDate)
            dateFilter.lte = endDate;
        const tournaments = await this.prisma.tournament.findMany({
            where: {
                gameId: { in: gameIds },
                status: 'COMPLETED',
                ...(Object.keys(dateFilter).length > 0 && { actualEnd: dateFilter }),
            },
            include: { game: { select: { name: true, revenueShare: true } } },
        });
        const revenueByGame = {};
        for (const tournament of tournaments) {
            const platformFee = parseFloat(tournament.platformFeeAmount.toString());
            const developerShare = platformFee * (parseFloat(tournament.game.revenueShare.toString()) / 100);
            if (!revenueByGame[tournament.gameId]) {
                revenueByGame[tournament.gameId] = {
                    gameId: tournament.gameId,
                    gameName: tournament.game.name,
                    totalRevenue: 0,
                    tournamentsCompleted: 0,
                };
            }
            revenueByGame[tournament.gameId].totalRevenue += developerShare;
            revenueByGame[tournament.gameId].tournamentsCompleted += 1;
        }
        const totalRevenue = Object.values(revenueByGame).reduce((sum, g) => sum + g.totalRevenue, 0);
        const payouts = await this.prisma.transaction.findMany({
            where: {
                userId: developerId,
                type: 'DEVELOPER_PAYOUT',
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        return {
            developerId,
            period: {
                start: startDate || null,
                end: endDate || null,
            },
            totalRevenue: totalRevenue.toFixed(8),
            revenueByGame: Object.values(revenueByGame),
            totalTournamentsCompleted: tournaments.length,
            recentPayouts: payouts.map((p) => ({
                id: p.id,
                amount: p.amount.toString(),
                currency: p.currency,
                status: p.status,
                txHash: p.txHash ?? undefined,
                createdAt: p.createdAt,
                completedAt: p.completedAt ?? undefined,
            })),
        };
    }
    async generateSdkKey(developerId, dto) {
        const game = await this.prisma.game.findUnique({
            where: { id: dto.gameId },
        });
        if (!game) {
            throw new common_1.NotFoundException('Game not found');
        }
        if (game.developerId !== developerId) {
            throw new common_1.ForbiddenException('Not authorized');
        }
        const apiKey = `dsk_${crypto.randomBytes(32).toString('hex')}`;
        const apiSecret = `dss_${crypto.randomBytes(32).toString('hex')}`;
        const keyData = {
            gameId: dto.gameId,
            developerId,
            name: dto.name,
            environment: dto.environment || 'development',
            createdAt: new Date().toISOString(),
        };
        await this.redis.hset(`sdk:key:${apiKey}`, keyData);
        await this.redis.sadd(`sdk:developer:${developerId}`, apiKey);
        return {
            apiKey,
            apiSecret,
            gameId: dto.gameId,
            name: dto.name,
            environment: dto.environment || 'development',
            createdAt: new Date(),
        };
    }
    async listSdkKeys(developerId) {
        const keyIds = await this.redis.smembers(`sdk:developer:${developerId}`);
        const keys = await Promise.all(keyIds.map(async (apiKey) => {
            const data = await this.redis.hgetall(`sdk:key:${apiKey}`);
            return {
                apiKey: `${apiKey.slice(0, 12)}...${apiKey.slice(-4)}`,
                gameId: data.gameId,
                name: data.name,
                environment: data.environment,
                createdAt: new Date(data.createdAt),
            };
        }));
        return keys;
    }
    async revokeSdkKey(developerId, apiKey) {
        const keyData = await this.redis.hgetall(`sdk:key:${apiKey}`);
        if (!keyData || keyData.developerId !== developerId) {
            throw new common_1.ForbiddenException('Not authorized to revoke this key');
        }
        await this.redis.del(`sdk:key:${apiKey}`);
        await this.redis.srem(`sdk:developer:${developerId}`, apiKey);
    }
    async requestPayout(developerId, dto) {
        const games = await this.prisma.game.findMany({
            where: { developerId },
        });
        const totalEarnings = games.reduce((sum, g) => sum + parseFloat(g.totalRevenue.toString()), 0);
        const paidOut = await this.prisma.transaction.aggregate({
            where: {
                userId: developerId,
                type: 'DEVELOPER_PAYOUT',
                status: 'COMPLETED',
            },
            _sum: { amount: true },
        });
        const availableBalance = totalEarnings - parseFloat(paidOut._sum.amount?.toString() || '0');
        if (dto.amount > availableBalance) {
            throw new common_1.BadRequestException('Insufficient balance');
        }
        const transaction = await this.prisma.transaction.create({
            data: {
                userId: developerId,
                type: 'DEVELOPER_PAYOUT',
                amount: dto.amount,
                currency: dto.currency,
                toAddress: dto.walletAddress,
                chain: dto.chain,
                status: 'PENDING',
                description: `Developer payout request`,
            },
        });
        return {
            id: transaction.id,
            amount: dto.amount.toString(),
            currency: dto.currency,
            walletAddress: dto.walletAddress,
            status: 'PENDING',
            estimatedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000),
            createdAt: transaction.createdAt,
        };
    }
    async upgradeToDeveloper(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { role: 'DEVELOPER' },
        });
    }
};
exports.DeveloperService = DeveloperService;
exports.DeveloperService = DeveloperService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ioredis_1.default])
], DeveloperService);
//# sourceMappingURL=developer.service.js.map