import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import {
  DeveloperDashboardDto,
  GameAnalyticsDto,
  RevenueReportDto,
  SdkKeyDto,
  CreateSdkKeyDto,
  PayoutRequestDto,
  PayoutResponseDto,
  DeveloperSettingsDto,
  UpdateDeveloperSettingsDto,
} from './dto/developer.dto';

@Injectable()
export class DeveloperService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  /**
   * Get developer dashboard overview
   */
  async getDashboard(developerId: string): Promise<DeveloperDashboardDto> {
    // Get developer's games
    const games = await this.prisma.game.findMany({
      where: { developerId },
      include: {
        _count: { select: { tournaments: true } },
      },
    });

    const gameIds = games.map((g) => g.id);

    // Get total matches across all games
    const totalMatches = games.reduce((sum, g) => sum + g.totalMatches, 0);

    // Get total revenue
    const totalRevenue = games.reduce(
      (sum, g) => sum + parseFloat(g.totalRevenue.toString()),
      0,
    );

    // Get active tournaments count
    const activeTournaments = await this.prisma.tournament.count({
      where: {
        gameId: { in: gameIds },
        status: { in: ['SCHEDULED', 'OPEN', 'IN_PROGRESS'] },
      },
    });

    // Get total unique players
    const uniquePlayers = await this.prisma.tournamentEntry.findMany({
      where: {
        tournament: { gameId: { in: gameIds } },
      },
      distinct: ['userId'],
      select: { userId: true },
    });

    // Get pending payouts
    const pendingPayouts = await this.prisma.transaction.aggregate({
      where: {
        userId: developerId,
        type: 'DEVELOPER_PAYOUT',
        status: 'PENDING',
      },
      _sum: { amount: true },
    });

    // Get recent activity
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

  /**
   * Get detailed analytics for a specific game
   */
  async getGameAnalytics(
    developerId: string,
    gameId: string,
  ): Promise<GameAnalyticsDto> {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.developerId !== developerId) {
      throw new ForbiddenException('Not authorized to view this game');
    }

    // Get tournament stats
    const tournamentStats = await this.prisma.tournament.groupBy({
      by: ['status'],
      where: { gameId },
      _count: { _all: true },
    });

    // Get daily match counts for last 30 days
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

    // Get player retention (unique players in last 7 days vs 30 days)
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

    // Get average scores
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
      tournamentsByStatus: tournamentStats.reduce(
        (acc, t) => ({ ...acc, [t.status]: t._count._all }),
        {},
      ),
      playersLast7Days: playersLast7Days.length,
      playersLast30Days: playersLast30Days.length,
      retentionRate:
        playersLast30Days.length > 0
          ? Math.round(
              (playersLast7Days.length / playersLast30Days.length) * 100,
            )
          : 0,
      averageScore: avgScore._avg.score || 0,
      highestScore: avgScore._max.score || 0,
      lowestScore: avgScore._min.score || 0,
    };
  }

  /**
   * Get revenue report for developer
   */
  async getRevenueReport(
    developerId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<RevenueReportDto> {
    const games = await this.prisma.game.findMany({
      where: { developerId },
      select: { id: true, name: true, revenueShare: true },
    });

    const gameIds = games.map((g) => g.id);

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    // Get completed tournaments with prize pools
    const tournaments = await this.prisma.tournament.findMany({
      where: {
        gameId: { in: gameIds },
        status: 'COMPLETED',
        ...(Object.keys(dateFilter).length > 0 && { actualEnd: dateFilter }),
      },
      include: { game: { select: { name: true, revenueShare: true } } },
    });

    // Calculate revenue by game
    const revenueByGame: Record<string, any> = {};

    for (const tournament of tournaments) {
      const platformFee = parseFloat(tournament.platformFeeAmount.toString());
      // Developer share is calculated from the platform fee
      const developerShare =
        platformFee * (parseFloat(tournament.game.revenueShare.toString()) / 100);

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

    const totalRevenue = Object.values(revenueByGame).reduce(
      (sum: number, g: any) => sum + g.totalRevenue,
      0,
    );

    // Get payout history
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

  /**
   * Generate SDK API key for a game
   */
  async generateSdkKey(
    developerId: string,
    dto: CreateSdkKeyDto,
  ): Promise<SdkKeyDto> {
    const game = await this.prisma.game.findUnique({
      where: { id: dto.gameId },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.developerId !== developerId) {
      throw new ForbiddenException('Not authorized');
    }

    // Generate API key
    const apiKey = `dsk_${crypto.randomBytes(32).toString('hex')}`;
    const apiSecret = `dss_${crypto.randomBytes(32).toString('hex')}`;

    // Store in Redis with game association
    const keyData = {
      gameId: dto.gameId,
      developerId,
      name: dto.name,
      environment: dto.environment || 'development',
      createdAt: new Date().toISOString(),
    };

    await this.redis.hset(`sdk:key:${apiKey}`, keyData);

    // Store key reference for developer
    await this.redis.sadd(`sdk:developer:${developerId}`, apiKey);

    return {
      apiKey,
      apiSecret, // Only shown once
      gameId: dto.gameId,
      name: dto.name,
      environment: dto.environment || 'development',
      createdAt: new Date(),
    };
  }

  /**
   * List SDK keys for developer
   */
  async listSdkKeys(developerId: string): Promise<Omit<SdkKeyDto, 'apiSecret'>[]> {
    const keyIds = await this.redis.smembers(`sdk:developer:${developerId}`);

    const keys = await Promise.all(
      keyIds.map(async (apiKey) => {
        const data = await this.redis.hgetall(`sdk:key:${apiKey}`);
        return {
          apiKey: `${apiKey.slice(0, 12)}...${apiKey.slice(-4)}`, // Masked
          gameId: data.gameId,
          name: data.name,
          environment: data.environment,
          createdAt: new Date(data.createdAt),
        };
      }),
    );

    return keys;
  }

  /**
   * Revoke SDK key
   */
  async revokeSdkKey(developerId: string, apiKey: string): Promise<void> {
    const keyData = await this.redis.hgetall(`sdk:key:${apiKey}`);

    if (!keyData || keyData.developerId !== developerId) {
      throw new ForbiddenException('Not authorized to revoke this key');
    }

    await this.redis.del(`sdk:key:${apiKey}`);
    await this.redis.srem(`sdk:developer:${developerId}`, apiKey);
  }

  /**
   * Request payout
   */
  async requestPayout(
    developerId: string,
    dto: PayoutRequestDto,
  ): Promise<PayoutResponseDto> {
    // Verify developer has sufficient balance
    // Calculate available balance from completed tournaments

    const games = await this.prisma.game.findMany({
      where: { developerId },
    });

    const totalEarnings = games.reduce(
      (sum, g) => sum + parseFloat(g.totalRevenue.toString()),
      0,
    );

    // Get already paid out amount
    const paidOut = await this.prisma.transaction.aggregate({
      where: {
        userId: developerId,
        type: 'DEVELOPER_PAYOUT',
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    });

    const availableBalance =
      totalEarnings - parseFloat(paidOut._sum.amount?.toString() || '0');

    if (dto.amount > availableBalance) {
      throw new BadRequestException('Insufficient balance');
    }

    // Create payout request
    const transaction = await this.prisma.transaction.create({
      data: {
        userId: developerId,
        type: 'DEVELOPER_PAYOUT',
        amount: dto.amount,
        currency: dto.currency as any,
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
      estimatedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: transaction.createdAt,
    };
  }

  /**
   * Upgrade user to developer role
   */
  async upgradeToDeveloper(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'DEVELOPER' },
    });
  }
}
