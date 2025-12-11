import { LeaderboardService } from './leaderboard.service';
import { LeaderboardQueryDto, LeaderboardResponseDto, UserRankDto, GameStatsDto, PlatformStatsDto } from './dto/leaderboard.dto';
export declare class LeaderboardController {
    private readonly leaderboardService;
    constructor(leaderboardService: LeaderboardService);
    getGlobalLeaderboard(query: LeaderboardQueryDto): Promise<LeaderboardResponseDto>;
    getGameLeaderboard(gameId: string, query: LeaderboardQueryDto): Promise<LeaderboardResponseDto>;
    getGameStats(gameId: string): Promise<GameStatsDto>;
    getPlatformStats(): Promise<PlatformStatsDto>;
    getMyRank(userId: string): Promise<UserRankDto>;
    getMyGameRank(userId: string, gameId: string): Promise<UserRankDto>;
    getUserRank(userId: string): Promise<UserRankDto>;
}
