import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserWithWalletDto, UpdateUserDto, UserResponseDto, UserStatsDto } from './dto/users.dto';
export declare class UsersService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: Redis);
    createWithWallet(dto: CreateUserWithWalletDto): Promise<UserResponseDto>;
    findByWalletAddress(walletAddress: string): Promise<UserResponseDto | null>;
    findById(id: string): Promise<UserResponseDto>;
    findByUsername(username: string): Promise<UserResponseDto>;
    update(id: string, dto: UpdateUserDto): Promise<UserResponseDto>;
    getStats(id: string): Promise<UserStatsDto>;
    addWallet(userId: string, walletAddress: string, chain: string, walletType: string): Promise<{
        walletAddress: string;
        chain: string;
        walletType: string;
        label: string | null;
        id: string;
        isPrimary: boolean;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
    }>;
    removeWallet(userId: string, walletId: string): Promise<void>;
    getWallets(userId: string): Promise<{
        walletAddress: string;
        chain: string;
        walletType: string;
        label: string | null;
        id: string;
        isPrimary: boolean;
        createdAt: Date;
    }[]>;
    private toUserResponse;
    private cacheUser;
    private invalidateUserCache;
}
