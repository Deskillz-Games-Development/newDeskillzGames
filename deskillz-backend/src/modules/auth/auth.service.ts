import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SiweMessage, generateNonce } from 'siwe';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { REDIS_CLIENT, RedisKeys, CacheTTL } from '../../config/redis.module';

import {
  WalletLoginDto,
  WalletVerifyDto,
  RefreshTokenDto,
  AuthResponseDto,
  NonceResponseDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  /**
   * Generate a nonce for SIWE authentication
   */
  async generateNonce(walletAddress: string): Promise<NonceResponseDto> {
    const nonce = generateNonce();

    // Store nonce in Redis with expiration
    await this.redis.setex(
      RedisKeys.siweNonce(nonce),
      CacheTTL.SIWE_NONCE,
      walletAddress.toLowerCase(),
    );

    return { nonce };
  }

  /**
   * Verify wallet signature and authenticate user
   */
  async verifyWalletSignature(dto: WalletVerifyDto): Promise<AuthResponseDto> {
    const { message, signature } = dto;

    try {
      // Parse and verify the SIWE message
      const siweMessage = new SiweMessage(message);
      const fields = await siweMessage.verify({ signature });

      if (!fields.success) {
        throw new UnauthorizedException('Invalid signature');
      }

      const { address, nonce, domain } = siweMessage;

      // Verify domain
      const expectedDomain = this.configService.get<string>('siwe.domain');
      if (domain !== expectedDomain) {
        throw new UnauthorizedException('Invalid domain');
      }

      // Verify nonce exists and matches
      const storedAddress = await this.redis.get(RedisKeys.siweNonce(nonce));
      if (!storedAddress || storedAddress !== address.toLowerCase()) {
        throw new UnauthorizedException('Invalid or expired nonce');
      }

      // Delete used nonce
      await this.redis.del(RedisKeys.siweNonce(nonce));

      // Find or create user
      let user = await this.usersService.findByWalletAddress(address);

      if (!user) {
        // Create new user with wallet
        user = await this.usersService.createWithWallet({
          walletAddress: address,
          chain: 'ethereum', // Default chain
        });
      }

      // Generate tokens
      const tokens = await this.generateTokens(user.id);

      // Create session
      await this.createSession(user.id, tokens.refreshToken);

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return {
        ...tokens,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
      };
    } catch (error) {
      this.logger.error('Wallet verification failed:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to verify signature');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { refreshToken } = dto;

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      // Check if session exists
      const session = await this.prisma.userSession.findFirst({
        where: {
          userId: payload.sub,
          refreshToken,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(session.userId);

      // Update session with new refresh token
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: {
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(
            Date.now() +
              this.parseExpiration(
                this.configService.get<string>('jwt.refreshExpiresIn', '30d'),
              ),
          ),
        },
      });

      return {
        ...tokens,
        user: {
          id: session.user.id,
          username: session.user.username,
         displayName: session.user.displayName ?? undefined,
avatarUrl: session.user.avatarUrl ?? undefined,
          role: session.user.role,
        },
      };
    } catch (error) {
      this.logger.error('Token refresh failed:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout - invalidate session
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Delete specific session
      await this.prisma.userSession.deleteMany({
        where: { userId, refreshToken },
      });
    } else {
      // Delete all sessions for user
      await this.prisma.userSession.deleteMany({
        where: { userId },
      });
    }

    // Clear Redis cache
    await this.redis.del(RedisKeys.user(userId));
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn', '7d'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '30d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Create a new session
   */
  private async createSession(
    userId: string,
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<void> {
    const expiresIn = this.parseExpiration(
      this.configService.get<string>('jwt.refreshExpiresIn', '30d'),
    );

    await this.prisma.userSession.create({
      data: {
        userId,
        refreshToken,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + expiresIn),
      },
    });

    // Clean up old sessions (keep max 5 per user)
    const sessions = await this.prisma.userSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: 5,
    });

    if (sessions.length > 0) {
      await this.prisma.userSession.deleteMany({
        where: {
          id: { in: sessions.map((s) => s.id) },
        },
      });
    }
  }

  /**
   * Parse expiration string to milliseconds
   */
  private parseExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Validate user for JWT strategy
   */
  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}
