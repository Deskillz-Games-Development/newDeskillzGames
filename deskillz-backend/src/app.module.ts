import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';

// Configuration
import configuration from './config/configuration';
import { validate } from './config/env.validation';

// Core Modules
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './config/redis.module';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GamesModule } from './modules/games/games.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { DeveloperModule } from './modules/developer/developer.module';
import { AIModule } from './modules/ai/ai.module';

// Gateway (Socket.io)
import { EventsGateway } from './gateway/events.gateway';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
      },
    ]),

    // Bull Queue (Background Jobs)
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),

    // Core
    PrismaModule,
    RedisModule,

    // Features
    AuthModule,
    UsersModule,
    GamesModule,
    TournamentsModule,
    WalletModule,
    LeaderboardModule,
    DeveloperModule,
    AIModule,
  ],
  providers: [EventsGateway],
})
export class AppModule {}