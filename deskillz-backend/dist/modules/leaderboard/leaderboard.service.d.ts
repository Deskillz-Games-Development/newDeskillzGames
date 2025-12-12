import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { LeaderboardQueryDto, LeaderboardResponseDto, UserRankDto, GameStatsDto, PlatformStatsDto } from './dto/leaderboard.dto';
export declare class LeaderboardService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: Redis);
    getGlobalLeaderboard(query: LeaderboardQueryDto): Promise<LeaderboardResponseDto>;
    getGameLeaderboard(gameId: string, query: LeaderboardQueryDto): Promise<LeaderboardResponseDto>;
    getUserRank(userId: string, gameId?: string): Promise<UserRankDto>;
    getGameStats(gameId: string): Promise<GameStatsDto | null>;
    getPlatformStats(): Promise<PlatformStatsDto>;
    private getDateFilter;
}
