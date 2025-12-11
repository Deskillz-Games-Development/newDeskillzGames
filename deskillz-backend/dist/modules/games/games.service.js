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
exports.GamesService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_module_1 = require("../../config/redis.module");
const client_1 = require("@prisma/client");
let GamesService = class GamesService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async create(developerId, dto) {
        const slug = this.generateSlug(dto.name);
        const game = await this.prisma.game.create({
            data: {
                developerId,
                name: dto.name,
                slug,
                description: dto.description,
                shortDescription: dto.shortDescription,
                iconUrl: dto.iconUrl,
                bannerUrl: dto.bannerUrl,
                screenshots: dto.screenshots || [],
                videoUrl: dto.videoUrl,
                genre: dto.genre || [],
                tags: dto.tags || [],
                platform: dto.platform,
                androidUrl: dto.androidUrl,
                iosUrl: dto.iosUrl,
                minPlayers: dto.minPlayers || 2,
                maxPlayers: dto.maxPlayers || 10,
                avgMatchDuration: dto.avgMatchDuration,
                supportsSync: dto.supportsSync ?? true,
                supportsAsync: dto.supportsAsync ?? true,
                demoEnabled: dto.demoEnabled ?? false,
                status: client_1.GameStatus.DRAFT,
            },
            include: { developer: { select: { id: true, username: true, displayName: true } } },
        });
        return this.toGameResponse(game);
    }
    async findAll(query) {
        const { page = 1, limit = 20, status, genre, platform, search, developerId, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        else {
            where.status = client_1.GameStatus.APPROVED;
        }
        if (genre) {
            where.genre = { has: genre };
        }
        if (platform) {
            where.platform = { in: [platform, 'BOTH'] };
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search } },
            ];
        }
        if (developerId) {
            where.developerId = developerId;
        }
        const [games, total] = await Promise.all([
            this.prisma.game.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    developer: { select: { id: true, username: true, displayName: true } },
                    _count: { select: { tournaments: true } },
                },
            }),
            this.prisma.game.count({ where }),
        ]);
        return {
            games: games.map((g) => this.toGameResponse(g)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
        const cached = await this.redis.get(redis_module_1.RedisKeys.game(id));
        if (cached) {
            return JSON.parse(cached);
        }
        const game = await this.prisma.game.findUnique({
            where: { id },
            include: {
                developer: { select: { id: true, username: true, displayName: true } },
                _count: { select: { tournaments: true } },
            },
        });
        if (!game) {
            throw new common_1.NotFoundException('Game not found');
        }
        const response = this.toGameResponse(game);
        await this.redis.setex(redis_module_1.RedisKeys.game(id), redis_module_1.CacheTTL.GAME, JSON.stringify(response));
        return response;
    }
    async findBySlug(slug) {
        const game = await this.prisma.game.findUnique({
            where: { slug },
            include: {
                developer: { select: { id: true, username: true, displayName: true } },
                _count: { select: { tournaments: true } },
            },
        });
        if (!game) {
            throw new common_1.NotFoundException('Game not found');
        }
        return this.toGameResponse(game);
    }
    async update(id, developerId, dto) {
        const game = await this.prisma.game.findUnique({ where: { id } });
        if (!game) {
            throw new common_1.NotFoundException('Game not found');
        }
        if (game.developerId !== developerId) {
            throw new common_1.ForbiddenException('Not authorized to update this game');
        }
        const updated = await this.prisma.game.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                shortDescription: dto.shortDescription,
                iconUrl: dto.iconUrl,
                bannerUrl: dto.bannerUrl,
                screenshots: dto.screenshots,
                videoUrl: dto.videoUrl,
                genre: dto.genre,
                tags: dto.tags,
                androidUrl: dto.androidUrl,
                iosUrl: dto.iosUrl,
                minPlayers: dto.minPlayers,
                maxPlayers: dto.maxPlayers,
                avgMatchDuration: dto.avgMatchDuration,
                supportsSync: dto.supportsSync,
                supportsAsync: dto.supportsAsync,
                demoEnabled: dto.demoEnabled,
            },
            include: {
                developer: { select: { id: true, username: true, displayName: true } },
            },
        });
        await this.redis.del(redis_module_1.RedisKeys.game(id));
        return this.toGameResponse(updated);
    }
    async submitForReview(id, developerId) {
        const game = await this.prisma.game.findUnique({ where: { id } });
        if (!game) {
            throw new common_1.NotFoundException('Game not found');
        }
        if (game.developerId !== developerId) {
            throw new common_1.ForbiddenException('Not authorized');
        }
        if (game.status !== client_1.GameStatus.DRAFT && game.status !== client_1.GameStatus.REJECTED) {
            throw new common_1.ForbiddenException('Game cannot be submitted for review');
        }
        const updated = await this.prisma.game.update({
            where: { id },
            data: { status: client_1.GameStatus.PENDING_REVIEW },
            include: {
                developer: { select: { id: true, username: true, displayName: true } },
            },
        });
        await this.redis.del(redis_module_1.RedisKeys.game(id));
        return this.toGameResponse(updated);
    }
    async approve(id) {
        const game = await this.prisma.game.findUnique({ where: { id } });
        if (!game) {
            throw new common_1.NotFoundException('Game not found');
        }
        const updated = await this.prisma.game.update({
            where: { id },
            data: {
                status: client_1.GameStatus.APPROVED,
                approvedAt: new Date(),
                launchedAt: new Date(),
            },
            include: {
                developer: { select: { id: true, username: true, displayName: true } },
            },
        });
        await this.redis.del(redis_module_1.RedisKeys.game(id));
        return this.toGameResponse(updated);
    }
    async reject(id, reason) {
        const game = await this.prisma.game.findUnique({ where: { id } });
        if (!game) {
            throw new common_1.NotFoundException('Game not found');
        }
        const updated = await this.prisma.game.update({
            where: { id },
            data: {
                status: client_1.GameStatus.REJECTED,
                rejectionReason: reason,
            },
            include: {
                developer: { select: { id: true, username: true, displayName: true } },
            },
        });
        await this.redis.del(redis_module_1.RedisKeys.game(id));
        return this.toGameResponse(updated);
    }
    async getFeatured(limit = 6) {
        const games = await this.prisma.game.findMany({
            where: { status: client_1.GameStatus.APPROVED },
            orderBy: [{ totalMatches: 'desc' }, { avgRating: 'desc' }],
            take: limit,
            include: {
                developer: { select: { id: true, username: true, displayName: true } },
            },
        });
        return games.map((g) => this.toGameResponse(g));
    }
    toGameResponse(game) {
        return {
            id: game.id,
            developerId: game.developerId,
            developer: game.developer,
            name: game.name,
            slug: game.slug,
            description: game.description,
            shortDescription: game.shortDescription,
            iconUrl: game.iconUrl,
            bannerUrl: game.bannerUrl,
            screenshots: game.screenshots,
            videoUrl: game.videoUrl,
            genre: game.genre,
            tags: game.tags,
            platform: game.platform,
            androidUrl: game.androidUrl,
            iosUrl: game.iosUrl,
            minPlayers: game.minPlayers,
            maxPlayers: game.maxPlayers,
            avgMatchDuration: game.avgMatchDuration,
            supportsSync: game.supportsSync,
            supportsAsync: game.supportsAsync,
            demoEnabled: game.demoEnabled,
            status: game.status,
            totalMatches: game.totalMatches,
            totalPlayers: game.totalPlayers,
            avgRating: parseFloat(game.avgRating?.toString() || '0'),
            ratingCount: game.ratingCount,
            tournamentsCount: game._count?.tournaments || 0,
            createdAt: game.createdAt,
            approvedAt: game.approvedAt,
            launchedAt: game.launchedAt,
        };
    }
    generateSlug(name) {
        const base = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        return `${base}-${Date.now().toString(36)}`;
    }
};
exports.GamesService = GamesService;
exports.GamesService = GamesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ioredis_1.default])
], GamesService);
//# sourceMappingURL=games.service.js.map