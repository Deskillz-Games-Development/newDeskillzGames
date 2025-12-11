export declare enum TournamentMode {
    SYNC = "SYNC",
    ASYNC = "ASYNC"
}
export declare enum TournamentStatus {
    SCHEDULED = "SCHEDULED",
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum CryptoCurrency {
    ETH = "ETH",
    BTC = "BTC",
    BNB = "BNB",
    SOL = "SOL",
    XRP = "XRP",
    USDT_ETH = "USDT_ETH",
    USDT_TRON = "USDT_TRON",
    USDT_BSC = "USDT_BSC",
    USDC_ETH = "USDC_ETH",
    USDC_POLYGON = "USDC_POLYGON",
    USDC_ARB = "USDC_ARB",
    USDC_BASE = "USDC_BASE"
}
export declare enum EntryStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PLAYING = "PLAYING",
    COMPLETED = "COMPLETED",
    FORFEITED = "FORFEITED",
    REFUNDED = "REFUNDED"
}
export declare class CreateTournamentDto {
    gameId: string;
    name: string;
    description?: string;
    mode: TournamentMode;
    entryFee: number;
    entryCurrency: CryptoCurrency;
    prizePool: number;
    prizeCurrency: CryptoCurrency;
    minPlayers?: number;
    maxPlayers: number;
    prizeDistribution: Record<string, number>;
    scheduledStart: string;
    scheduledEnd?: string;
    matchDuration?: number;
    roundsCount?: number;
    platformFeePercent?: number;
}
export declare class TournamentQueryDto {
    page?: number;
    limit?: number;
    status?: TournamentStatus;
    mode?: TournamentMode;
    gameId?: string;
    minEntryFee?: number;
    maxEntryFee?: number;
    currency?: CryptoCurrency;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class JoinTournamentDto {
    txHash?: string;
}
export declare class SubmitScoreDto {
    score: number;
    metadata?: Record<string, any>;
    signature?: string;
}
export declare class GameInfoDto {
    id: string;
    name: string;
    slug: string;
    iconUrl?: string;
}
export declare class UserInfoDto {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
}
export declare class TournamentResponseDto {
    id: string;
    gameId: string;
    game: GameInfoDto;
    name: string;
    description?: string;
    mode: string;
    entryFee: string;
    entryCurrency: string;
    prizePool: string;
    prizeCurrency: string;
    minPlayers: number;
    maxPlayers: number;
    currentPlayers: number;
    prizeDistribution: Record<string, number>;
    scheduledStart: Date;
    scheduledEnd?: Date;
    actualStart?: Date;
    actualEnd?: Date;
    matchDuration?: number;
    roundsCount: number;
    status: string;
    platformFeePercent: number;
    entriesCount: number;
    createdAt: Date;
}
export declare class TournamentEntryResponseDto {
    id: string;
    tournamentId: string;
    tournament?: TournamentResponseDto;
    userId: string;
    user: UserInfoDto;
    entryAmount: string;
    entryCurrency: string;
    entryTxHash?: string;
    status: string;
    finalRank?: number;
    prizeWon?: string;
    prizeTxHash?: string;
    joinedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}
export declare class LeaderboardEntryDto {
    rank: number;
    userId: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    score: number;
    submittedAt: Date;
}
export declare class PaginationDto {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export declare class TournamentListResponseDto {
    tournaments: TournamentResponseDto[];
    pagination: PaginationDto;
}
