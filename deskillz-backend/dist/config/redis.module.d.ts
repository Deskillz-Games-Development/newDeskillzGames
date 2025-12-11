import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare const REDIS_CLIENT = "REDIS_CLIENT";
export declare class RedisModule implements OnModuleDestroy {
    private readonly configService;
    constructor(configService: ConfigService);
    onModuleDestroy(): void;
}
export declare const RedisKeys: {
    session: (userId: string) => string;
    refreshToken: (token: string) => string;
    user: (userId: string) => string;
    userByWallet: (address: string) => string;
    game: (gameId: string) => string;
    gamesList: (filters: string) => string;
    tournament: (tournamentId: string) => string;
    tournamentPlayers: (tournamentId: string) => string;
    tournamentLeaderboard: (tournamentId: string) => string;
    matchmakingQueue: (gameId: string, mode: string) => string;
    matchmakingUser: (userId: string) => string;
    leaderboardGlobal: (period: string) => string;
    leaderboardGame: (gameId: string, period: string) => string;
    rateLimit: (key: string) => string;
    socketUser: (userId: string) => string;
    socketRoom: (room: string) => string;
    siweNonce: (nonce: string) => string;
    lock: (resource: string) => string;
};
export declare const CacheTTL: {
    SHORT: number;
    MEDIUM: number;
    LONG: number;
    DAY: number;
    WEEK: number;
    USER: number;
    GAME: number;
    TOURNAMENT: number;
    LEADERBOARD: number;
    SESSION: number;
    REFRESH_TOKEN: number;
    SIWE_NONCE: number;
};
