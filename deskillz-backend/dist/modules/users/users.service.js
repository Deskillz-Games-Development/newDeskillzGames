"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_module_1 = require("../../config/redis.module");
let UsersService = class UsersService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async createWithWallet(dto) {
        const { walletAddress, chain = 'ethereum' } = dto;
        const normalizedAddress = walletAddress.toLowerCase();
        const existingWallet = await this.prisma.walletAccount.findUnique({
            where: {
                walletAddress_chain: {
                    walletAddress: normalizedAddress,
                    chain,
                },
            },
        });
        if (existingWallet) {
            throw new common_1.ConflictException('Wallet already registered');
        }
        const shortAddress = `${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)}`;
        let username = `player_${normalizedAddress.slice(2, 10)}`;
        const existingUser = await this.prisma.user.findUnique({
            where: { username },
        });
        if (existingUser) {
            username = `player_${Date.now().toString(36)}`;
        }
        const user = await this.prisma.user.create({
            data: {
                username,
                displayName: shortAddress,
                wallets: {
                    create: {
                        walletAddress: normalizedAddress,
                        chain,
                        walletType: 'external',
                        isPrimary: true,
                    },
                },
            },
            include: {
                wallets: true,
            },
        });
        await this.cacheUser(user);
        return this.toUserResponse(user);
    }
    async findByWalletAddress(walletAddress) {
        const normalizedAddress = walletAddress.toLowerCase();
        const cached = await this.redis.get(redis_module_1.RedisKeys.userByWallet(normalizedAddress));
        if (cached) {
            return JSON.parse(cached);
        }
        const wallet = await this.prisma.walletAccount.findFirst({
            where: { walletAddress: normalizedAddress },
            include: {
                user: {
                    include: { wallets: true },
                },
            },
        });
        if (!wallet) {
            return null;
        }
        const userResponse = this.toUserResponse(wallet.user);
        await this.redis.setex(redis_module_1.RedisKeys.userByWallet(normalizedAddress), redis_module_1.CacheTTL.USER, JSON.stringify(userResponse));
        return userResponse;
    }
    async findById(id) {
        const cached = await this.redis.get(redis_module_1.RedisKeys.user(id));
        if (cached) {
            return JSON.parse(cached);
        }
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { wallets: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const userResponse = this.toUserResponse(user);
        await this.cacheUser(user);
        return userResponse;
    }
    async findByUsername(username) {
        const user = await this.prisma.user.findUnique({
            where: { username },
            include: { wallets: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.toUserResponse(user);
    }
    async update(id, dto) {
        if (dto.username) {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    username: dto.username,
                    id: { not: id },
                },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Username already taken');
            }
        }
        const user = await this.prisma.user.update({
            where: { id },
            data: {
                username: dto.username,
                displayName: dto.displayName,
                email: dto.email,
                avatarUrl: dto.avatarUrl,
                notificationsEnabled: dto.notificationsEnabled,
                emailNotifications: dto.emailNotifications,
            },
            include: { wallets: true },
        });
        await this.invalidateUserCache(id);
        return this.toUserResponse(user);
    }
    async getStats(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                totalWins: true,
                totalMatches: true,
                totalEarnings: true,
                skillRating: true,
                _count: {
                    select: {
                        tournamentEntries: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const winRate = user.totalMatches > 0
            ? (user.totalWins / user.totalMatches) * 100
            : 0;
        return {
            totalWins: user.totalWins,
            totalMatches: user.totalMatches,
            totalEarnings: user.totalEarnings.toString(),
            skillRating: user.skillRating,
            winRate: Math.round(winRate * 100) / 100,
            tournamentsPlayed: user._count.tournamentEntries,
        };
    }
    async addWallet(userId, walletAddress, chain, walletType) {
        const normalizedAddress = walletAddress.toLowerCase();
        const existingWallet = await this.prisma.walletAccount.findFirst({
            where: { walletAddress: normalizedAddress },
        });
        if (existingWallet) {
            throw new common_1.ConflictException('Wallet already registered');
        }
        const wallet = await this.prisma.walletAccount.create({
            data: {
                userId,
                walletAddress: normalizedAddress,
                chain,
                walletType,
                isPrimary: false,
            },
        });
        await this.invalidateUserCache(userId);
        return wallet;
    }
    async removeWallet(userId, walletId) {
        const wallet = await this.prisma.walletAccount.findFirst({
            where: { id: walletId, userId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        if (wallet.isPrimary) {
            throw new common_1.BadRequestException('Cannot remove primary wallet');
        }
        await this.prisma.walletAccount.delete({
            where: { id: walletId },
        });
        await this.invalidateUserCache(userId);
    }
    async getWallets(userId) {
        return this.prisma.walletAccount.findMany({
            where: { userId },
            select: {
                id: true,
                walletAddress: true,
                chain: true,
                walletType: true,
                isPrimary: true,
                label: true,
                createdAt: true,
            },
        });
    }
    toUserResponse(user) {
        return {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            avatarUrl: user.avatarUrl,
            role: user.role,
            status: user.status,
            skillRating: user.skillRating,
            createdAt: user.createdAt,
            wallets: user.wallets?.map((w) => ({
                id: w.id,
                walletAddress: w.walletAddress,
                chain: w.chain,
                walletType: w.walletType,
                isPrimary: w.isPrimary,
                label: w.label,
            })),
        };
    }
    async cacheUser(user) {
        const userResponse = this.toUserResponse(user);
        const cacheValue = JSON.stringify(userResponse);
        await Promise.all([
            this.redis.setex(redis_module_1.RedisKeys.user(user.id), redis_module_1.CacheTTL.USER, cacheValue),
            ...user.wallets.map((w) => this.redis.setex(redis_module_1.RedisKeys.userByWallet(w.walletAddress), redis_module_1.CacheTTL.USER, cacheValue)),
        ]);
    }
    async invalidateUserCache(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { wallets: true },
        });
        if (user) {
            await Promise.all([
                this.redis.del(redis_module_1.RedisKeys.user(userId)),
                ...user.wallets.map((w) => this.redis.del(redis_module_1.RedisKeys.userByWallet(w.walletAddress))),
            ]);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ioredis_1.default])
], UsersService);
//# sourceMappingURL=users.service.js.map