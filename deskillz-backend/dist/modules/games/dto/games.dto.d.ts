export declare enum GamePlatform {
    ANDROID = "ANDROID",
    IOS = "IOS",
    BOTH = "BOTH"
}
export declare enum GameStatus {
    DRAFT = "DRAFT",
    PENDING_REVIEW = "PENDING_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    SUSPENDED = "SUSPENDED"
}
export declare class CreateGameDto {
    name: string;
    description: string;
    shortDescription?: string;
    iconUrl?: string;
    bannerUrl?: string;
    screenshots?: string[];
    videoUrl?: string;
    genre?: string[];
    tags?: string[];
    platform: GamePlatform;
    androidUrl?: string;
    iosUrl?: string;
    minPlayers?: number;
    maxPlayers?: number;
    avgMatchDuration?: number;
    supportsSync?: boolean;
    supportsAsync?: boolean;
    demoEnabled?: boolean;
}
export declare class UpdateGameDto {
    name?: string;
    description?: string;
    shortDescription?: string;
    iconUrl?: string;
    bannerUrl?: string;
    screenshots?: string[];
    videoUrl?: string;
    genre?: string[];
    tags?: string[];
    androidUrl?: string;
    iosUrl?: string;
    minPlayers?: number;
    maxPlayers?: number;
    avgMatchDuration?: number;
    supportsSync?: boolean;
    supportsAsync?: boolean;
    demoEnabled?: boolean;
}
export declare class GameQueryDto {
    page?: number;
    limit?: number;
    status?: GameStatus;
    genre?: string;
    platform?: GamePlatform;
    search?: string;
    developerId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class RejectGameDto {
    reason: string;
}
export declare class DeveloperInfoDto {
    id: string;
    username: string;
    displayName?: string;
}
export declare class GameResponseDto {
    id: string;
    developerId: string;
    developer: DeveloperInfoDto;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;
    iconUrl?: string;
    bannerUrl?: string;
    screenshots: string[];
    videoUrl?: string;
    genre: string[];
    tags: string[];
    platform: string;
    androidUrl?: string;
    iosUrl?: string;
    minPlayers: number;
    maxPlayers: number;
    avgMatchDuration?: number;
    supportsSync: boolean;
    supportsAsync: boolean;
    demoEnabled: boolean;
    status: string;
    totalMatches: number;
    totalPlayers: number;
    avgRating: number;
    ratingCount: number;
    tournamentsCount: number;
    createdAt: Date;
    approvedAt?: Date;
    launchedAt?: Date;
}
export declare class PaginationDto {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export declare class GameListResponseDto {
    games: GameResponseDto[];
    pagination: PaginationDto;
}
