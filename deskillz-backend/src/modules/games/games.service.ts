import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT, RedisKeys, CacheTTL } from '../../config/redis.module';
import { GameStatus, Prisma } from '@prisma/client';
import {
  CreateGameDto,
  UpdateGameDto,
  GameQueryDto,
  GameResponseDto,
  GameListResponseDto,
} from './dto/games.dto';

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  /**
   * Create a new game (Developer only)
   */
  async create(developerId: string, dto: CreateGameDto): Promise<GameResponseDto> {
    // Generate slug from name
    const slug = this.generateSlug(dto.name);

    const game = await this.prisma.game.create({
      data: {
        developerId,
        name: dto.name,
        slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        iconUrl: dto.iconUrl,
        bannerUrl: dto.bannerUrl,
        screenshots: dto.screenshots || [],
        videoUrl: dto.videoUrl,
        genre: dto.genre || [],
        tags: dto.tags || [],
        platform: dto.platform,
        androidUrl: dto.androidUrl,
        iosUrl: dto.iosUrl,
        minPlayers: dto.minPlayers || 2,
        maxPlayers: dto.maxPlayers || 10,
        avgMatchDuration: dto.avgMatchDuration,
        supportsSync: dto.supportsSync ?? true,
        supportsAsync: dto.supportsAsync ?? true,
        demoEnabled: dto.demoEnabled ?? false,
        status: GameStatus.DRAFT,
      },
      include: { developer: { select: { id: true, username: true, displayName: true } } },
    });

    return this.toGameResponse(game);
  }

  /**
   * Get all games with filtering and pagination
   */
  async findAll(query: GameQueryDto): Promise<GameListResponseDto> {
    const {
      page = 1,
      limit = 20,
      status,
      genre,
      platform,
      search,
      developerId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.GameWhereInput = {};

    if (status) {
      where.status = status;
    } else {
      // Default to only approved games for public
      where.status = GameStatus.APPROVED;
    }

    if (genre) {
      where.genre = { has: genre };
    }

    if (platform) {
      where.platform = { in: [platform, 'BOTH'] };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    if (developerId) {
      where.developerId = developerId;
    }

    // Execute queries
    const [games, total] = await Promise.all([
      this.prisma.game.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          developer: { select: { id: true, username: true, displayName: true } },
          _count: { select: { tournaments: true } },
        },
      }),
      this.prisma.game.count({ where }),
    ]);

    return {
      games: games.map((g) => this.toGameResponse(g)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get game by ID
   */
  async findById(id: string): Promise<GameResponseDto> {
    // Check cache
    const cached = await this.redis.get(RedisKeys.game(id));
    if (cached) {
      return JSON.parse(cached);
    }

    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        developer: { select: { id: true, username: true, displayName: true } },
        _count: { select: { tournaments: true } },
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const response = this.toGameResponse(game);

    // Cache result
    await this.redis.setex(
      RedisKeys.game(id),
      CacheTTL.GAME,
      JSON.stringify(response),
    );

    return response;
  }

  /**
   * Get game by slug
   */
  async findBySlug(slug: string): Promise<GameResponseDto> {
    const game = await this.prisma.game.findUnique({
      where: { slug },
      include: {
        developer: { select: { id: true, username: true, displayName: true } },
        _count: { select: { tournaments: true } },
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return this.toGameResponse(game);
  }

  /**
   * Update game (Developer only)
   */
  async update(
    id: string,
    developerId: string,
    dto: UpdateGameDto,
  ): Promise<GameResponseDto> {
    const game = await this.prisma.game.findUnique({ where: { id } });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.developerId !== developerId) {
      throw new ForbiddenException('Not authorized to update this game');
    }

    const updated = await this.prisma.game.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        shortDescription: dto.shortDescription,
        iconUrl: dto.iconUrl,
        bannerUrl: dto.bannerUrl,
        screenshots: dto.screenshots,
        videoUrl: dto.videoUrl,
        genre: dto.genre,
        tags: dto.tags,
        androidUrl: dto.androidUrl,
        iosUrl: dto.iosUrl,
        minPlayers: dto.minPlayers,
        maxPlayers: dto.maxPlayers,
        avgMatchDuration: dto.avgMatchDuration,
        supportsSync: dto.supportsSync,
        supportsAsync: dto.supportsAsync,
        demoEnabled: dto.demoEnabled,
      },
      include: {
        developer: { select: { id: true, username: true, displayName: true } },
      },
    });

    // Invalidate cache
    await this.redis.del(RedisKeys.game(id));

    return this.toGameResponse(updated);
  }

  /**
   * Submit game for review
   */
  async submitForReview(id: string, developerId: string): Promise<GameResponseDto> {
    const game = await this.prisma.game.findUnique({ where: { id } });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.developerId !== developerId) {
      throw new ForbiddenException('Not authorized');
    }

    if (game.status !== GameStatus.DRAFT && game.status !== GameStatus.REJECTED) {
      throw new ForbiddenException('Game cannot be submitted for review');
    }

    const updated = await this.prisma.game.update({
      where: { id },
      data: { status: GameStatus.PENDING_REVIEW },
      include: {
        developer: { select: { id: true, username: true, displayName: true } },
      },
    });

    await this.redis.del(RedisKeys.game(id));

    return this.toGameResponse(updated);
  }

  /**
   * Approve game (Admin only)
   */
  async approve(id: string): Promise<GameResponseDto> {
    const game = await this.prisma.game.findUnique({ where: { id } });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const updated = await this.prisma.game.update({
      where: { id },
      data: {
        status: GameStatus.APPROVED,
        approvedAt: new Date(),
        launchedAt: new Date(),
      },
      include: {
        developer: { select: { id: true, username: true, displayName: true } },
      },
    });

    await this.redis.del(RedisKeys.game(id));

    return this.toGameResponse(updated);
  }

  /**
   * Reject game (Admin only)
   */
  async reject(id: string, reason: string): Promise<GameResponseDto> {
    const game = await this.prisma.game.findUnique({ where: { id } });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const updated = await this.prisma.game.update({
      where: { id },
      data: {
        status: GameStatus.REJECTED,
        rejectionReason: reason,
      },
      include: {
        developer: { select: { id: true, username: true, displayName: true } },
      },
    });

    await this.redis.del(RedisKeys.game(id));

    return this.toGameResponse(updated);
  }

  /**
   * Get featured games
   */
  async getFeatured(limit: number = 6): Promise<GameResponseDto[]> {
    const games = await this.prisma.game.findMany({
      where: { status: GameStatus.APPROVED },
      orderBy: [{ totalMatches: 'desc' }, { avgRating: 'desc' }],
      take: limit,
      include: {
        developer: { select: { id: true, username: true, displayName: true } },
      },
    });

    return games.map((g) => this.toGameResponse(g));
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  private toGameResponse(game: any): GameResponseDto {
    return {
      id: game.id,
      developerId: game.developerId,
      developer: game.developer,
      name: game.name,
      slug: game.slug,
      description: game.description,
      shortDescription: game.shortDescription,
      iconUrl: game.iconUrl,
      bannerUrl: game.bannerUrl,
      screenshots: game.screenshots,
      videoUrl: game.videoUrl,
      genre: game.genre,
      tags: game.tags,
      platform: game.platform,
      androidUrl: game.androidUrl,
      iosUrl: game.iosUrl,
      minPlayers: game.minPlayers,
      maxPlayers: game.maxPlayers,
      avgMatchDuration: game.avgMatchDuration,
      supportsSync: game.supportsSync,
      supportsAsync: game.supportsAsync,
      demoEnabled: game.demoEnabled,
      status: game.status,
      totalMatches: game.totalMatches,
      totalPlayers: game.totalPlayers,
      avgRating: parseFloat(game.avgRating?.toString() || '0'),
      ratingCount: game.ratingCount,
      tournamentsCount: game._count?.tournaments || 0,
      createdAt: game.createdAt,
      approvedAt: game.approvedAt,
      launchedAt: game.launchedAt,
    };
  }

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return `${base}-${Date.now().toString(36)}`;
  }
}
