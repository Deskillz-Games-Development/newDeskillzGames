import { UsersService } from './users.service';
import { UpdateUserDto, AddWalletDto, UserResponseDto, UserStatsDto } from './dto/users.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(userId: string): Promise<UserResponseDto>;
    updateProfile(userId: string, dto: UpdateUserDto): Promise<UserResponseDto>;
    getMyStats(userId: string): Promise<UserStatsDto>;
    getMyWallets(userId: string): Promise<{
        walletAddress: string;
        chain: string;
        walletType: string;
        label: string | null;
        id: string;
        isPrimary: boolean;
        createdAt: Date;
    }[]>;
    addWallet(userId: string, dto: AddWalletDto): Promise<{
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
    getUserByUsername(username: string): Promise<UserResponseDto>;
    getUserById(id: string): Promise<UserResponseDto>;
    getUserStats(id: string): Promise<UserStatsDto>;
}
