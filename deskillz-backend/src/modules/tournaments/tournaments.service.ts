import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT, RedisKeys, CacheTTL } from '../../config/redis.module';
import { TournamentStatus, TournamentMode, EntryStatus, Prisma } from '@prisma/client';
import {
  CreateTournamentDto,
  TournamentQueryDto,
  TournamentResponseDto,
  TournamentListResponseDto,
  JoinTournamentDto,
  SubmitScoreDto,
  TournamentEntryResponseDto,
  LeaderboardEntryDto,
} from './dto/tournaments.dto';

@Injectable()
export class TournamentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @InjectQueue('tournaments') private readonly tournamentQueue: Queue,
  ) {}

  /**
   * Create a new tournament
   */
  async create(dto: CreateTournamentDto): Promise<TournamentResponseDto> {
    // Verify game exists
    const game = await this.prisma.game.findUnique({
      where: { id: dto.gameId },
    });

    if (!game || game.status !== 'APPROVED') {
      throw new BadRequestException('Invalid or unapproved game');
    }

    // Validate tournament mode
    if (dto.mode === TournamentMode.SYNC && !game.supportsSync) {
      throw new BadRequestException('Game does not support synchronous mode');
    }
    if (dto.mode === TournamentMode.ASYNC && !game.supportsAsync) {
      throw new BadRequestException('Game does not support asynchronous mode');
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
        prizeDistribution: dto.prizeDistribution as any,
        scheduledStart: new Date(dto.scheduledStart),
        scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : null,
        matchDuration: dto.matchDuration,
        roundsCount: dto.roundsCount || 1,
        platformFeePercent: dto.platformFeePercent || 10,
        status: TournamentStatus.SCHEDULED,
      },
      include: {
        game: { select: { id: true, name: true, slug: true, iconUrl: true } },
        _count: { select: { entries: true } },
      },
    });

    // Schedule tournament start job
    await this.tournamentQueue.add(
      'start-tournament',
      { tournamentId: tournament.id },
      { delay: new Date(dto.scheduledStart).getTime() - Date.now() },
    );

    return this.toTournamentResponse(tournament);
  }

  /**
   * Get all tournaments with filtering
   */
  async findAll(query: TournamentQueryDto): Promise<TournamentListResponseDto> {
    const {
      page = 1,
      limit = 20,
      status,
      mode,
      gameId,
      minEntryFee,
      maxEntryFee,
      currency,
      sortBy = 'scheduledStart',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.TournamentWhereInput = {};

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
      if (minEntryFee !== undefined) where.entryFee.gte = minEntryFee;
      if (maxEntryFee !== undefined) where.entryFee.lte = maxEntryFee;
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

  /**
   * Get tournament by ID
   */
  async findById(id: string): Promise<TournamentResponseDto> {
    const cached = await this.redis.get(RedisKeys.tournament(id));
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
      throw new NotFoundException('Tournament not found');
    }

    const response = this.toTournamentResponse(tournament);

    await this.redis.setex(
      RedisKeys.tournament(id),
      CacheTTL.TOURNAMENT,
      JSON.stringify(response),
    );

    return response;
  }

  /**
   * Join a tournament
   */
  async join(
    tournamentId: string,
    userId: string,
    dto: JoinTournamentDto,
  ): Promise<TournamentEntryResponseDto> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { _count: { select: { entries: true } } },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    // Validate tournament is open for entries
    if (tournament.status !== TournamentStatus.SCHEDULED && 
        tournament.status !== TournamentStatus.OPEN) {
      throw new BadRequestException('Tournament is not accepting entries');
    }

    // Check if already joined
    const existingEntry = await this.prisma.tournamentEntry.findUnique({
      where: {
        tournamentId_userId: { tournamentId, userId },
      },
    });

    if (existingEntry) {
      throw new BadRequestException('Already joined this tournament');
    }

    // Check max players
    if (tournament._count.entries >= tournament.maxPlayers) {
      throw new BadRequestException('Tournament is full');
    }

    // Create entry (payment verification would happen here)
    const entry = await this.prisma.tournamentEntry.create({
      data: {
        tournamentId,
        userId,
        entryAmount: tournament.entryFee,
        entryCurrency: tournament.entryCurrency,
        entryTxHash: dto.txHash,
        status: dto.txHash ? EntryStatus.CONFIRMED : EntryStatus.PENDING,
      },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });

    // Update current players count
    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: { currentPlayers: { increment: 1 } },
    });

    // Invalidate cache
    await this.redis.del(RedisKeys.tournament(tournamentId));

    return this.toEntryResponse(entry);
  }

  /**
   * Leave a tournament
   */
  async leave(tournamentId: string, userId: string): Promise<void> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    // Can only leave before tournament starts
    if (tournament.status !== TournamentStatus.SCHEDULED && 
        tournament.status !== TournamentStatus.OPEN) {
      throw new BadRequestException('Cannot leave an active tournament');
    }

    const entry = await this.prisma.tournamentEntry.findUnique({
      where: {
        tournamentId_userId: { tournamentId, userId },
      },
    });

    if (!entry) {
      throw new NotFoundException('Not enrolled in this tournament');
    }

    // Delete entry and schedule refund
    await this.prisma.tournamentEntry.update({
      where: { id: entry.id },
      data: { status: EntryStatus.REFUNDED },
    });

    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: { currentPlayers: { decrement: 1 } },
    });

    // Queue refund processing
    await this.tournamentQueue.add('process-refund', {
      entryId: entry.id,
      userId,
      amount: entry.entryAmount,
      currency: entry.entryCurrency,
    });

    await this.redis.del(RedisKeys.tournament(tournamentId));
  }

  /**
   * Submit score for a tournament
   */
  async submitScore(
    tournamentId: string,
    userId: string,
    dto: SubmitScoreDto,
  ): Promise<void> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.status !== TournamentStatus.IN_PROGRESS) {
      throw new BadRequestException('Tournament is not in progress');
    }

    // Verify user is enrolled
    const entry = await this.prisma.tournamentEntry.findUnique({
      where: {
        tournamentId_userId: { tournamentId, userId },
      },
    });

    if (!entry || entry.status !== EntryStatus.PLAYING) {
      throw new ForbiddenException('Not authorized to submit score');
    }

    // Create or update score
    await this.prisma.gameScore.upsert({
      where: {
        id: `${tournamentId}-${userId}`, // This should be a proper unique identifier
      },
      create: {
        tournamentId,
        userId,
        gameId: tournament.gameId,
        score: dto.score,
        metadata: dto.metadata as any,
        signature: dto.signature,
        verified: false, // Will be verified by anti-cheat system
      },
      update: {
        score: dto.score,
        metadata: dto.metadata as any,
        signature: dto.signature,
      },
    });

    // Mark entry as completed
    await this.prisma.tournamentEntry.update({
      where: { id: entry.id },
      data: {
        status: EntryStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Invalidate leaderboard cache
    await this.redis.del(RedisKeys.tournamentLeaderboard(tournamentId));
  }

  /**
   * Get tournament leaderboard
   */
  async getLeaderboard(tournamentId: string): Promise<LeaderboardEntryDto[]> {
    const cached = await this.redis.get(
      RedisKeys.tournamentLeaderboard(tournamentId),
    );
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

    await this.redis.setex(
      RedisKeys.tournamentLeaderboard(tournamentId),
      CacheTTL.SHORT,
      JSON.stringify(leaderboard),
    );

    return leaderboard;
  }

  /**
   * Get user's tournament entries
   */
  async getUserEntries(userId: string): Promise<TournamentEntryResponseDto[]> {
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

  /**
   * Get active tournaments for a game
   */
  async getActiveByGame(gameId: string): Promise<TournamentResponseDto[]> {
    const tournaments = await this.prisma.tournament.findMany({
      where: {
        gameId,
        status: { in: [TournamentStatus.SCHEDULED, TournamentStatus.OPEN] },
      },
      orderBy: { scheduledStart: 'asc' },
      include: {
        game: { select: { id: true, name: true, slug: true, iconUrl: true } },
        _count: { select: { entries: true } },
      },
    });

    return tournaments.map((t) => this.toTournamentResponse(t));
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  private toTournamentResponse(tournament: any): TournamentResponseDto {
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

  private toEntryResponse(entry: any): TournamentEntryResponseDto {
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
}
