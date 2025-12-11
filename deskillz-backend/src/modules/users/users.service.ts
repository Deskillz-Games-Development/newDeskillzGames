import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT, RedisKeys, CacheTTL } from '../../config/redis.module';
import {
  CreateUserDto,
  CreateUserWithWalletDto,
  UpdateUserDto,
  UserResponseDto,
  UserStatsDto,
} from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  /**
   * Create a new user with wallet address
   */
  async createWithWallet(dto: CreateUserWithWalletDto): Promise<UserResponseDto> {
    const { walletAddress, chain = 'ethereum' } = dto;
    const normalizedAddress = walletAddress.toLowerCase();

    // Check if wallet already exists
    const existingWallet = await this.prisma.walletAccount.findUnique({
      where: {
        walletAddress_chain: {
          walletAddress: normalizedAddress,
          chain,
        },
      },
    });

    if (existingWallet) {
      throw new ConflictException('Wallet already registered');
    }

    // Generate unique username from wallet address
    const shortAddress = `${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)}`;
    let username = `player_${normalizedAddress.slice(2, 10)}`;

    // Ensure username is unique
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      username = `player_${Date.now().toString(36)}`;
    }

    // Create user with wallet in a transaction
    const user = await this.prisma.user.create({
      data: {
        username,
        displayName: shortAddress,
        wallets: {
          create: {
            walletAddress: normalizedAddress,
            chain,
            walletType: 'external',
            isPrimary: true,
          },
        },
      },
      include: {
        wallets: true,
      },
    });

    // Cache user
    await this.cacheUser(user);

    return this.toUserResponse(user);
  }

  /**
   * Find user by wallet address
   */
  async findByWalletAddress(walletAddress: string): Promise<UserResponseDto | null> {
    const normalizedAddress = walletAddress.toLowerCase();

    // Check cache first
    const cached = await this.redis.get(
      RedisKeys.userByWallet(normalizedAddress),
    );
    if (cached) {
      return JSON.parse(cached);
    }

    const wallet = await this.prisma.walletAccount.findFirst({
      where: { walletAddress: normalizedAddress },
      include: {
        user: {
          include: { wallets: true },
        },
      },
    });

    if (!wallet) {
      return null;
    }

    const userResponse = this.toUserResponse(wallet.user);

    // Cache result
    await this.redis.setex(
      RedisKeys.userByWallet(normalizedAddress),
      CacheTTL.USER,
      JSON.stringify(userResponse),
    );

    return userResponse;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserResponseDto> {
    // Check cache first
    const cached = await this.redis.get(RedisKeys.user(id));
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { wallets: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userResponse = this.toUserResponse(user);

    // Cache result
    await this.cacheUser(user);

    return userResponse;
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { wallets: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toUserResponse(user);
  }

  /**
   * Update user profile
   */
  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    // Check if username is being changed and if it's available
    if (dto.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          username: dto.username,
          id: { not: id },
        },
      });

      if (existingUser) {
        throw new ConflictException('Username already taken');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        username: dto.username,
        displayName: dto.displayName,
        email: dto.email,
        avatarUrl: dto.avatarUrl,
        notificationsEnabled: dto.notificationsEnabled,
        emailNotifications: dto.emailNotifications,
      },
      include: { wallets: true },
    });

    // Invalidate cache
    await this.invalidateUserCache(id);

    return this.toUserResponse(user);
  }

  /**
   * Get user stats
   */
  async getStats(id: string): Promise<UserStatsDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        totalWins: true,
        totalMatches: true,
        totalEarnings: true,
        skillRating: true,
        _count: {
          select: {
            tournamentEntries: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const winRate =
      user.totalMatches > 0
        ? (user.totalWins / user.totalMatches) * 100
        : 0;

    return {
      totalWins: user.totalWins,
      totalMatches: user.totalMatches,
      totalEarnings: user.totalEarnings.toString(),
      skillRating: user.skillRating,
      winRate: Math.round(winRate * 100) / 100,
      tournamentsPlayed: user._count.tournamentEntries,
    };
  }

  /**
   * Add wallet to user
   */
  async addWallet(
    userId: string,
    walletAddress: string,
    chain: string,
    walletType: string,
  ) {
    const normalizedAddress = walletAddress.toLowerCase();

    // Check if wallet already exists
    const existingWallet = await this.prisma.walletAccount.findFirst({
      where: { walletAddress: normalizedAddress },
    });

    if (existingWallet) {
      throw new ConflictException('Wallet already registered');
    }

    const wallet = await this.prisma.walletAccount.create({
      data: {
        userId,
        walletAddress: normalizedAddress,
        chain,
        walletType,
        isPrimary: false,
      },
    });

    // Invalidate cache
    await this.invalidateUserCache(userId);

    return wallet;
  }

  /**
   * Remove wallet from user
   */
  async removeWallet(userId: string, walletId: string) {
    const wallet = await this.prisma.walletAccount.findFirst({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.isPrimary) {
      throw new BadRequestException('Cannot remove primary wallet');
    }

    await this.prisma.walletAccount.delete({
      where: { id: walletId },
    });

    // Invalidate cache
    await this.invalidateUserCache(userId);
  }

  /**
   * Get user's wallets
   */
  async getWallets(userId: string) {
    return this.prisma.walletAccount.findMany({
      where: { userId },
      select: {
        id: true,
        walletAddress: true,
        chain: true,
        walletType: true,
        isPrimary: true,
        label: true,
        createdAt: true,
      },
    });
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  private toUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status,
      skillRating: user.skillRating,
      createdAt: user.createdAt,
      wallets: user.wallets?.map((w: any) => ({
        id: w.id,
        walletAddress: w.walletAddress,
        chain: w.chain,
        walletType: w.walletType,
        isPrimary: w.isPrimary,
        label: w.label,
      })),
    };
  }

  private async cacheUser(user: any) {
    const userResponse = this.toUserResponse(user);
    const cacheValue = JSON.stringify(userResponse);

    await Promise.all([
      this.redis.setex(RedisKeys.user(user.id), CacheTTL.USER, cacheValue),
      ...user.wallets.map((w: any) =>
        this.redis.setex(
          RedisKeys.userByWallet(w.walletAddress),
          CacheTTL.USER,
          cacheValue,
        ),
      ),
    ]);
  }

  private async invalidateUserCache(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallets: true },
    });

    if (user) {
      await Promise.all([
        this.redis.del(RedisKeys.user(userId)),
        ...user.wallets.map((w) =>
          this.redis.del(RedisKeys.userByWallet(w.walletAddress)),
        ),
      ]);
    }
  }
}
