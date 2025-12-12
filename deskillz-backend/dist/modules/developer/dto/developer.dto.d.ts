export declare enum SdkEnvironment {
    DEVELOPMENT = "development",
    STAGING = "staging",
    PRODUCTION = "production"
}
export declare class CreateSdkKeyDto {
    gameId: string;
    name: string;
    environment?: SdkEnvironment;
}
export declare class PayoutRequestDto {
    amount: number;
    currency: string;
    walletAddress: string;
    chain: string;
}
export declare class UpdateDeveloperSettingsDto {
    companyName?: string;
    website?: string;
    supportEmail?: string;
    defaultPayoutWallet?: string;
    defaultPayoutChain?: string;
}
export declare class GameSummaryDto {
    id: string;
    name: string;
    status: string;
    totalMatches: number;
    totalPlayers: number;
    revenue: string;
    tournamentsCount: number;
}
export declare class RecentActivityDto {
    type: string;
    gameName: string;
    tournamentName: string;
    players: number;
    status: string;
    createdAt: Date;
}
export declare class DeveloperDashboardDto {
    totalGames: number;
    approvedGames: number;
    pendingGames: number;
    totalMatches: number;
    totalPlayers: number;
    totalRevenue: string;
    pendingPayouts: string;
    activeTournaments: number;
    games: GameSummaryDto[];
    recentActivity: RecentActivityDto[];
}
export declare class GameAnalyticsDto {
    gameId: string;
    gameName: string;
    status: string;
    totalMatches: number;
    totalPlayers: number;
    totalRevenue: string;
    averageRating: number;
    tournamentsByStatus: Record<string, number>;
    playersLast7Days: number;
    playersLast30Days: number;
    retentionRate: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
}
export declare class GameRevenueDto {
    gameId: string;
    gameName: string;
    totalRevenue: number;
    tournamentsCompleted: number;
}
export declare class PayoutHistoryDto {
    id: string;
    amount: string;
    currency: string;
    status: string;
    txHash?: string;
    createdAt: Date;
    completedAt?: Date;
}
export declare class RevenueReportDto {
    developerId: string;
    period: {
        start: Date | null;
        end: Date | null;
    };
    totalRevenue: string;
    revenueByGame: GameRevenueDto[];
    totalTournamentsCompleted: number;
    recentPayouts: PayoutHistoryDto[];
}
export declare class SdkKeyDto {
    apiKey: string;
    apiSecret?: string;
    gameId: string;
    name: string;
    environment: string;
    createdAt: Date;
}
export declare class PayoutResponseDto {
    id: string;
    amount: string;
    currency: string;
    walletAddress: string;
    status: string;
    estimatedArrival: Date;
    createdAt: Date;
}
export declare class DeveloperSettingsDto {
    companyName?: string;
    website?: string;
    supportEmail?: string;
    defaultPayoutWallet?: string;
    defaultPayoutChain?: string;
}
