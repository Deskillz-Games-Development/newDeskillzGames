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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const siwe_1 = require("siwe");
const ioredis_1 = require("ioredis");
const prisma_service_1 = require("../../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
const redis_module_1 = require("../../config/redis.module");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, configService, usersService, redis) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.usersService = usersService;
        this.redis = redis;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async generateNonce(walletAddress) {
        const nonce = (0, siwe_1.generateNonce)();
        await this.redis.setex(redis_module_1.RedisKeys.siweNonce(nonce), redis_module_1.CacheTTL.SIWE_NONCE, walletAddress.toLowerCase());
        return { nonce };
    }
    async verifyWalletSignature(dto) {
        const { message, signature } = dto;
        try {
            const siweMessage = new siwe_1.SiweMessage(message);
            const fields = await siweMessage.verify({ signature });
            if (!fields.success) {
                throw new common_1.UnauthorizedException('Invalid signature');
            }
            const { address, nonce, domain } = siweMessage;
            const expectedDomain = this.configService.get('siwe.domain');
            if (domain !== expectedDomain) {
                throw new common_1.UnauthorizedException('Invalid domain');
            }
            const storedAddress = await this.redis.get(redis_module_1.RedisKeys.siweNonce(nonce));
            if (!storedAddress || storedAddress !== address.toLowerCase()) {
                throw new common_1.UnauthorizedException('Invalid or expired nonce');
            }
            await this.redis.del(redis_module_1.RedisKeys.siweNonce(nonce));
            let user = await this.usersService.findByWalletAddress(address);
            if (!user) {
                user = await this.usersService.createWithWallet({
                    walletAddress: address,
                    chain: 'ethereum',
                });
            }
            const tokens = await this.generateTokens(user.id);
            await this.createSession(user.id, tokens.refreshToken);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            });
            return {
                ...tokens,
                user: {
                    id: user.id,
                    username: user.username,
                    displayName: user.displayName,
                    avatarUrl: user.avatarUrl,
                    role: user.role,
                },
            };
        }
        catch (error) {
            this.logger.error('Wallet verification failed:', error);
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to verify signature');
        }
    }
    async refreshTokens(dto) {
        const { refreshToken } = dto;
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('jwt.refreshSecret'),
            });
            const session = await this.prisma.userSession.findFirst({
                where: {
                    userId: payload.sub,
                    refreshToken,
                    expiresAt: { gt: new Date() },
                },
                include: { user: true },
            });
            if (!session) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const tokens = await this.generateTokens(session.userId);
            await this.prisma.userSession.update({
                where: { id: session.id },
                data: {
                    refreshToken: tokens.refreshToken,
                    expiresAt: new Date(Date.now() +
                        this.parseExpiration(this.configService.get('jwt.refreshExpiresIn', '30d'))),
                },
            });
            return {
                ...tokens,
                user: {
                    id: session.user.id,
                    username: session.user.username,
                    displayName: session.user.displayName ?? undefined,
                    avatarUrl: session.user.avatarUrl ?? undefined,
                    role: session.user.role,
                },
            };
        }
        catch (error) {
            this.logger.error('Token refresh failed:', error);
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            await this.prisma.userSession.deleteMany({
                where: { userId, refreshToken },
            });
        }
        else {
            await this.prisma.userSession.deleteMany({
                where: { userId },
            });
        }
        await this.redis.del(redis_module_1.RedisKeys.user(userId));
    }
    async generateTokens(userId) {
        const payload = { sub: userId };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('jwt.secret'),
                expiresIn: this.configService.get('jwt.expiresIn', '7d'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('jwt.refreshSecret'),
                expiresIn: this.configService.get('jwt.refreshExpiresIn', '30d'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
    async createSession(userId, refreshToken, userAgent, ipAddress) {
        const expiresIn = this.parseExpiration(this.configService.get('jwt.refreshExpiresIn', '30d'));
        await this.prisma.userSession.create({
            data: {
                userId,
                refreshToken,
                userAgent,
                ipAddress,
                expiresAt: new Date(Date.now() + expiresIn),
            },
        });
        const sessions = await this.prisma.userSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: 5,
        });
        if (sessions.length > 0) {
            await this.prisma.userSession.deleteMany({
                where: {
                    id: { in: sessions.map((s) => s.id) },
                },
            });
        }
    }
    parseExpiration(expiration) {
        const match = expiration.match(/^(\d+)([smhd])$/);
        if (!match)
            return 7 * 24 * 60 * 60 * 1000;
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
            case 's':
                return value * 1000;
            case 'm':
                return value * 60 * 1000;
            case 'h':
                return value * 60 * 60 * 1000;
            case 'd':
                return value * 24 * 60 * 60 * 1000;
            default:
                return 7 * 24 * 60 * 60 * 1000;
        }
    }
    async validateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                displayName: true,
                email: true,
                avatarUrl: true,
                role: true,
                status: true,
            },
        });
        if (!user || user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        users_service_1.UsersService,
        ioredis_1.default])
], AuthService);
//# sourceMappingURL=auth.service.js.map