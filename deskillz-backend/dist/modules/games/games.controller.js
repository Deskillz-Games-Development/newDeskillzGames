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
exports.GamesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const games_service_1 = require("./games.service");
const games_dto_1 = require("./dto/games.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let GamesController = class GamesController {
    constructor(gamesService) {
        this.gamesService = gamesService;
    }
    async findAll(query) {
        return this.gamesService.findAll(query);
    }
    async getFeatured(limit) {
        return this.gamesService.getFeatured(limit);
    }
    async findBySlug(slug) {
        return this.gamesService.findBySlug(slug);
    }
    async findById(id) {
        return this.gamesService.findById(id);
    }
    async create(userId, dto) {
        return this.gamesService.create(userId, dto);
    }
    async update(id, userId, dto) {
        return this.gamesService.update(id, userId, dto);
    }
    async submitForReview(id, userId) {
        return this.gamesService.submitForReview(id, userId);
    }
    async approve(id) {
        return this.gamesService.approve(id);
    }
    async reject(id, dto) {
        return this.gamesService.reject(id, dto.reason);
    }
};
exports.GamesController = GamesController;
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get all games (public)", summary: 'Get all games with filtering' }),
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiResponse)({ status: 200, type: games_dto_1.GameListResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/games.dto").GameListResponseDto }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [games_dto_1.GameQueryDto]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get featured games (public)", summary: 'Get featured games' }),
    (0, common_1.Get)('featured'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiResponse)({ status: 200, type: [games_dto_1.GameResponseDto] }),
    openapi.ApiResponse({ status: 200, type: [require("./dto/games.dto").GameResponseDto] }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "getFeatured", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get game by slug (public)", summary: 'Get game by slug' }),
    (0, common_1.Get)('slug/:slug'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiResponse)({ status: 200, type: games_dto_1.GameResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/games.dto").GameResponseDto }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "findBySlug", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get game by ID (public)", summary: 'Get game by ID' }),
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiResponse)({ status: 200, type: games_dto_1.GameResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/games.dto").GameResponseDto }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "findById", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Create new game (Developer only)", summary: 'Create a new game' }),
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('DEVELOPER', 'ADMIN'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 201, type: games_dto_1.GameResponseDto }),
    openapi.ApiResponse({ status: 201, type: require("./dto/games.dto").GameResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, games_dto_1.CreateGameDto]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Update game (Developer only)", summary: 'Update a game' }),
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('DEVELOPER', 'ADMIN'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 200, type: games_dto_1.GameResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/games.dto").GameResponseDto }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, games_dto_1.UpdateGameDto]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Submit game for review (Developer only)", summary: 'Submit game for review' }),
    (0, common_1.Post)(':id/submit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('DEVELOPER', 'ADMIN'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 200, type: games_dto_1.GameResponseDto }),
    openapi.ApiResponse({ status: 201, type: require("./dto/games.dto").GameResponseDto }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "submitForReview", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Approve game (Admin only)", summary: 'Approve a game' }),
    (0, common_1.Post)(':id/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 200, type: games_dto_1.GameResponseDto }),
    openapi.ApiResponse({ status: 201, type: require("./dto/games.dto").GameResponseDto }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "approve", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Reject game (Admin only)", summary: 'Reject a game' }),
    (0, common_1.Post)(':id/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 200, type: games_dto_1.GameResponseDto }),
    openapi.ApiResponse({ status: 201, type: require("./dto/games.dto").GameResponseDto }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, games_dto_1.RejectGameDto]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "reject", null);
exports.GamesController = GamesController = __decorate([
    (0, swagger_1.ApiTags)('Games'),
    (0, common_1.Controller)('games'),
    __metadata("design:paramtypes", [games_service_1.GamesService])
], GamesController);
//# sourceMappingURL=games.controller.js.map