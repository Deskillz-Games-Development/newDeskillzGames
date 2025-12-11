import { Global, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const redis = new Redis({
          host: configService.get('redis.host', 'localhost'),
          port: configService.get('redis.port', 6379),
          password: configService.get('redis.password') || undefined,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 3,
        });

        redis.on('connect', () => {
          console.log('✅ Redis connected');
        });

        redis.on('error', (err) => {
          console.error('❌ Redis error:', err.message);
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnModuleDestroy {
  constructor(private readonly configService: ConfigService) {}

  onModuleDestroy() {
    // Redis cleanup is handled by the provider
  }
}

// Redis key prefixes for organization
export const RedisKeys = {
  // Sessions
  session: (userId: string) => `session:${userId}`,
  refreshToken: (token: string) => `refresh:${token}`,

  // User cache
  user: (userId: string) => `user:${userId}`,
  userByWallet: (address: string) => `user:wallet:${address.toLowerCase()}`,

  // Game cache
  game: (gameId: string) => `game:${gameId}`,
  gamesList: (filters: string) => `games:list:${filters}`,

  // Tournament cache
  tournament: (tournamentId: string) => `tournament:${tournamentId}`,
  tournamentPlayers: (tournamentId: string) =>
    `tournament:${tournamentId}:players`,
  tournamentLeaderboard: (tournamentId: string) =>
    `tournament:${tournamentId}:leaderboard`,

  // Matchmaking
  matchmakingQueue: (gameId: string, mode: string) =>
    `matchmaking:${gameId}:${mode}`,
  matchmakingUser: (userId: string) => `matchmaking:user:${userId}`,

  // Leaderboards (Sorted Sets)
  leaderboardGlobal: (period: string) => `leaderboard:global:${period}`,
  leaderboardGame: (gameId: string, period: string) =>
    `leaderboard:game:${gameId}:${period}`,

  // Rate limiting
  rateLimit: (key: string) => `ratelimit:${key}`,

  // Socket.io
  socketUser: (userId: string) => `socket:user:${userId}`,
  socketRoom: (room: string) => `socket:room:${room}`,

  // Nonces for SIWE
  siweNonce: (nonce: string) => `siwe:nonce:${nonce}`,

  // Locks (for distributed operations)
  lock: (resource: string) => `lock:${resource}`,
};

// Cache TTLs (in seconds)
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days

  // Specific TTLs
  USER: 300,
  GAME: 600,
  TOURNAMENT: 60,
  LEADERBOARD: 300,
  SESSION: 86400 * 7, // 7 days
  REFRESH_TOKEN: 86400 * 30, // 30 days
  SIWE_NONCE: 300, // 5 minutes
};
