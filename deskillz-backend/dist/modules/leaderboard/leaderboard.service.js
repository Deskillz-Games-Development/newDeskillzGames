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
exports.LeaderboardService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_module_1 = require("../../config/redis.module");
let LeaderboardService = class LeaderboardService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async getGlobalLeaderboard(query) {
        const { period = 'all_time', limit = 100, offset = 0 } = query;
        const cacheKey = `${redis_module_1.RedisKeys.leaderboardGlobal(period)}:${limit}:${offset}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const dateFilter = this.getDateFilter(period);
        const users = await this.prisma.user.findMany({
            where: {
                status: 'ACTIVE',
                totalMatches: { gt: 0 },
            },
            orderBy: [{ totalEarnings: 'desc' }, { totalWins: 'desc' }],
            skip: offset,
            take: limit,
            select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                totalWins: true,
                totalMatches: true,
                totalEarnings: true,
                skillRating: true,
            },
        });
        const entries = users.map((user, index) => ({
            rank: offset + index + 1,
            userId: user.id,
            username: user.username,
            displayName: user.displayName ?? undefined,
            avatarUrl: user.avatarUrl ?? undefined,
            wins: user.totalWins,
            matches: user.totalMatches,
            earnings: user.totalEarnings.toString(),
            skillRating: user.skillRating,
            winRate: user.totalMatches > 0
                ? Math.round((user.totalWins / user.totalMatches) * 100 * 100) / 100
                : 0,
        }));
        const totalPlayers = await this.prisma.user.count({
            where: { status: 'ACTIVE', totalMatches: { gt: 0 } },
        });
        const response = {
            period,
            entries,
            total: totalPlayers,
            lastUpdated: new Date(),
        };
        await this.redis.setex(cacheKey, redis_module_1.CacheTTL.LEADERBOARD, JSON.stringify(response));
        return response;
    }
    async getGameLeaderboard(gameId, query) {
        const { period = 'all_time', limit = 100, offset = 0 } = query;
        const cacheKey = `${redis_module_1.RedisKeys.leaderboardGame(gameId, period)}:${limit}:${offset}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const dateFilter = this.getDateFilter(period);
        const scores = await this.prisma.gameScore.groupBy({
            by: ['userId'],
            where: {
                gameId,
                ...(dateFilter ? { submittedAt: dateFilter } : {}),
            },
            _sum: { score: true },
            _count: { _all: true },
            orderBy: { _sum: { score: 'desc' } },
            skip: offset,
            take: limit,
        });
        const userIds = scores.map((s) => s.userId);
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                skillRating: true,
            },
        });
        const userMap = new Map(users.map((u) => [u.id, u]));
        const wins = await this.prisma.tournamentEntry.groupBy({
            by: ['userId'],
            where: {
                userId: { in: userIds },
                tournament: { gameId },
                finalRank: 1,
            },
            _count: { _all: true },
        });
        const winsMap = new Map(wins.map((w) => [w.userId, w._count._all]));
        const entries = scores.map((score, index) => {
            const user = userMap.get(score.userId);
            return {
                rank: offset + index + 1,
                userId: score.userId,
                username: user?.username || 'Unknown',
                displayName: user?.displayName ?? undefined,
                avatarUrl: user?.avatarUrl ?? undefined,
                totalScore: score._sum.score || 0,
                matches: score._count._all,
                wins: winsMap.get(score.userId) || 0,
                skillRating: user?.skillRating || 1000,
            };
        });
        const totalPlayers = await this.prisma.gameScore.groupBy({
            by: ['userId'],
            where: { gameId },
        });
        const response = {
            period,
            gameId,
            entries,
            total: totalPlayers.length,
            lastUpdated: new Date(),
        };
        await this.redis.setex(cacheKey, redis_module_1.CacheTTL.LEADERBOARD, JSON.stringify(response));
        return response;
    }
    async getUserRank(userId, gameId) {
        if (gameId) {
            const userScore = await this.prisma.gameScore.aggregate({
                where: { userId, gameId },
                _sum: { score: true },
            });
            if (!userScore._sum.score) {
                return {
                    userId,
                    globalRank: undefined,
                    gameRank: undefined,
                    message: 'User has not played this game',
                };
            }
            const higherScores = await this.prisma.gameScore.groupBy({
                by: ['userId'],
                where: { gameId },
                _sum: { score: true },
                having: {
                    score: { _sum: { gt: userScore._sum.score } },
                },
            });
            return {
                userId,
                gameId,
                gameRank: higherScores.length + 1,
                totalScore: userScore._sum.score,
            };
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { totalEarnings: true, totalWins: true },
        });
        if (!user) {
            return { userId, globalRank: undefined, message: 'User not found' };
        }
        const higherRanked = await this.prisma.user.count({
            where: {
                totalEarnings: { gt: user.totalEarnings },
                status: 'ACTIVE',
            },
        });
        return {
            userId,
            globalRank: higherRanked + 1,
            earnings: user.totalEarnings.toString(),
            wins: user.totalWins,
        };
    }
    async getGameStats(gameId) {
        const game = await this.prisma.game.findUnique({
            where: { id: gameId },
            select: {
                id: true,
                name: true,
                totalMatches: true,
                totalPlayers: true,
                avgRating: true,
                ratingCount: true,
            },
        });
        if (!game) {
            return null;
        }
        const tournamentStats = await this.prisma.tournament.aggregate({
            where: { gameId, status: 'COMPLETED' },
            _count: { _all: true },
            _sum: { prizePool: true },
        });
        const activeTournaments = await this.prisma.tournament.count({
            where: { gameId, status: { in: ['SCHEDULED', 'OPEN', 'IN_PROGRESS'] } },
        });
        return {
            gameId: game.id,
            gameName: game.name,
            totalMatches: game.totalMatches,
            totalPlayers: game.totalPlayers,
            averageRating: parseFloat(game.avgRating.toString()),
            totalRatings: game.ratingCount,
            completedTournaments: tournamentStats._count._all,
            totalPrizePool: tournamentStats._sum.prizePool?.toString() || '0',
            activeTournaments,
        };
    }
    async getPlatformStats() {
        const cached = await this.redis.get('platform:stats');
        if (cached) {
            return JSON.parse(cached);
        }
        const [totalUsers, activeUsers, totalGames, totalTournaments, completedTournaments, totalPrizeDistributed,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { status: 'ACTIVE' } }),
            this.prisma.game.count({ where: { status: 'APPROVED' } }),
            this.prisma.tournament.count(),
            this.prisma.tournament.count({ where: { status: 'COMPLETED' } }),
            this.prisma.transaction.aggregate({
                where: { type: 'PRIZE_WIN', status: 'COMPLETED' },
                _sum: { amount: true },
            }),
        ]);
        const stats = {
            totalUsers,
            activeUsers,
            totalGames,
            totalTournaments,
            completedTournaments,
            activeTournaments: totalTournaments - completedTournaments,
            totalPrizeDistributed: totalPrizeDistributed._sum.amount?.toString() || '0',
            lastUpdated: new Date(),
        };
        await this.redis.setex('platform:stats', 600, JSON.stringify(stats));
        return stats;
    }
    getDateFilter(period) {
        const now = new Date();
        switch (period) {
            case 'daily':
                const dayStart = new Date(now);
                dayStart.setHours(0, 0, 0, 0);
                return { gte: dayStart };
            case 'weekly':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                weekStart.setHours(0, 0, 0, 0);
                return { gte: weekStart };
            case 'monthly':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                return { gte: monthStart };
            case 'all_time':
            default:
                return null;
        }
    }
};
exports.LeaderboardService = LeaderboardService;
exports.LeaderboardService = LeaderboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ioredis_1.default])
], LeaderboardService);
//# sourceMappingURL=leaderboard.service.js.map