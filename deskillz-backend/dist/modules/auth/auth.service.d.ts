import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { WalletVerifyDto, RefreshTokenDto, AuthResponseDto, NonceResponseDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly usersService;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, usersService: UsersService, redis: Redis);
    generateNonce(walletAddress: string): Promise<NonceResponseDto>;
    verifyWalletSignature(dto: WalletVerifyDto): Promise<AuthResponseDto>;
    refreshTokens(dto: RefreshTokenDto): Promise<AuthResponseDto>;
    logout(userId: string, refreshToken?: string): Promise<void>;
    private generateTokens;
    private createSession;
    private parseExpiration;
    validateUser(userId: string): Promise<{
        username: string;
        email: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
}
