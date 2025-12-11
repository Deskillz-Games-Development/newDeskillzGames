export declare enum LeaderboardPeriod {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    ALL_TIME = "all_time"
}
export declare class LeaderboardQueryDto {
    period?: string;
    limit?: number;
    offset?: number;
}
export declare class LeaderboardEntryDto {
    rank: number;
    userId: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    wins?: number;
    matches?: number;
    earnings?: string;
    totalScore?: number;
    skillRating?: number;
    winRate?: number;
}
export declare class LeaderboardResponseDto {
    period: string;
    gameId?: string;
    entries: LeaderboardEntryDto[];
    total: number;
    lastUpdated: Date;
}
export declare class UserRankDto {
    userId: string;
    gameId?: string;
    globalRank?: number;
    gameRank?: number;
    earnings?: string;
    wins?: number;
    totalScore?: number;
    message?: string;
}
export declare class GameStatsDto {
    gameId: string;
    gameName: string;
    totalMatches: number;
    totalPlayers: number;
    averageRating: number;
    totalRatings: number;
    completedTournaments: number;
    totalPrizePool: string;
    activeTournaments: number;
}
export declare class PlatformStatsDto {
    totalUsers: number;
    activeUsers: number;
    totalGames: number;
    totalTournaments: number;
    completedTournaments: number;
    activeTournaments: number;
    totalPrizeDistributed: string;
    lastUpdated: Date;
}
