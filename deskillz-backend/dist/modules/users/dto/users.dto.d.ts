export declare class CreateUserDto {
    username: string;
    email?: string;
    displayName?: string;
}
export declare class CreateUserWithWalletDto {
    walletAddress: string;
    chain?: string;
}
export declare class UpdateUserDto {
    username?: string;
    displayName?: string;
    email?: string;
    avatarUrl?: string;
    notificationsEnabled?: boolean;
    emailNotifications?: boolean;
}
export declare class AddWalletDto {
    walletAddress: string;
    chain: string;
    walletType: string;
    label?: string;
}
export declare class WalletResponseDto {
    id: string;
    walletAddress: string;
    chain: string;
    walletType: string;
    isPrimary: boolean;
    label?: string;
}
export declare class UserResponseDto {
    id: string;
    username: string;
    displayName?: string;
    email?: string;
    avatarUrl?: string;
    role: string;
    status: string;
    skillRating: number;
    createdAt: Date;
    wallets?: WalletResponseDto[];
}
export declare class UserStatsDto {
    totalWins: number;
    totalMatches: number;
    totalEarnings: string;
    skillRating: number;
    winRate: number;
    tournamentsPlayed: number;
}
