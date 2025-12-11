import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT, RedisKeys, CacheTTL } from '../../config/redis.module';
import {
  LeaderboardQueryDto,
  LeaderboardResponseDto,
  LeaderboardEntryDto,
  UserRankDto,
  GameStatsDto,
  PlatformStatsDto,
} from './dto/leaderboard.dto';

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  /**
   * Get global leaderboard
   */
  async getGlobalLeaderboard(
    query: LeaderboardQueryDto,
  ): Promise<LeaderboardResponseDto> {
    const { period = 'all_time', limit = 100, offset = 0 } = query;

    const cacheKey = `${RedisKeys.leaderboardGlobal(period)}:${limit}:${offset}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Calculate date range based on period
    const dateFilter = this.getDateFilter(period);

    // Get top players by earnings and wins
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

    const entries: LeaderboardEntryDto[] = users.map((user, index) => ({
      rank: offset + index + 1,
      userId: user.id,
      username: user.username,
      displayName: user.displayName ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      wins: user.totalWins,
      matches: user.totalMatches,
      earnings: user.totalEarnings.toString(),
      skillRating: user.skillRating,
      winRate:
        user.totalMatches > 0
          ? Math.round((user.totalWins / user.totalMatches) * 100 * 100) / 100
          : 0,
    }));

    const totalPlayers = await this.prisma.user.count({
      where: { status: 'ACTIVE', totalMatches: { gt: 0 } },
    });

    const response: LeaderboardResponseDto = {
      period,
      entries,
      total: totalPlayers,
      lastUpdated: new Date(),
    };

    // Cache for 5 minutes
    await this.redis.setex(cacheKey, CacheTTL.LEADERBOARD, JSON.stringify(response));

    return response;
  }

  /**
   * Get game-specific leaderboard
   */
  async getGameLeaderboard(
    gameId: string,
    query: LeaderboardQueryDto,
  ): Promise<LeaderboardResponseDto> {
    const { period = 'all_time', limit = 100, offset = 0 } = query;

    const cacheKey = `${RedisKeys.leaderboardGame(gameId, period)}:${limit}:${offset}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const dateFilter = this.getDateFilter(period);

    // Aggregate scores from game tournaments
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

    // Get user details
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

    // Get win counts for each user in this game
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

    const entries: LeaderboardEntryDto[] = scores.map((score, index) => {
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

    const response: LeaderboardResponseDto = {
      period,
      gameId,
      entries,
      total: totalPlayers.length,
      lastUpdated: new Date(),
    };

    await this.redis.setex(cacheKey, CacheTTL.LEADERBOARD, JSON.stringify(response));

    return response;
  }

  /**
   * Get user's rank
   */
  async getUserRank(userId: string, gameId?: string): Promise<UserRankDto> {
    if (gameId) {
      // Game-specific rank
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

      // Count players with higher scores
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

    // Global rank
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { totalEarnings: true, totalWins: true },
    });

    if (!user) {
      return { userId, globalRank: undefined, message: 'User not found' };
    }

    // Count users with higher earnings
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

  /**
   * Get game statistics
   */
  async getGameStats(gameId: string): Promise<GameStatsDto | null> {
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

    // Get tournament stats
    const tournamentStats = await this.prisma.tournament.aggregate({
      where: { gameId, status: 'COMPLETED' },
      _count: { _all: true },
      _sum: { prizePool: true },
    });

    // Get active tournament count
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

  /**
   * Get platform-wide statistics
   */
  async getPlatformStats(): Promise<PlatformStatsDto> {
    const cached = await this.redis.get('platform:stats');
    if (cached) {
      return JSON.parse(cached);
    }

    const [
      totalUsers,
      activeUsers,
      totalGames,
      totalTournaments,
      completedTournaments,
      totalPrizeDistributed,
    ] = await Promise.all([
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

    const stats: PlatformStatsDto = {
      totalUsers,
      activeUsers,
      totalGames,
      totalTournaments,
      completedTournaments,
      activeTournaments: totalTournaments - completedTournaments,
      totalPrizeDistributed:
        totalPrizeDistributed._sum.amount?.toString() || '0',
      lastUpdated: new Date(),
    };

    // Cache for 10 minutes
    await this.redis.setex('platform:stats', 600, JSON.stringify(stats));

    return stats;
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  private getDateFilter(period: string): { gte?: Date; lte?: Date } | null {
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
}