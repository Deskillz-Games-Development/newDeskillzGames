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
exports.LeaderboardController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const leaderboard_service_1 = require("./leaderboard.service");
const leaderboard_dto_1 = require("./dto/leaderboard.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let LeaderboardController = class LeaderboardController {
    constructor(leaderboardService) {
        this.leaderboardService = leaderboardService;
    }
    async getGlobalLeaderboard(query) {
        return this.leaderboardService.getGlobalLeaderboard(query);
    }
    async getGameLeaderboard(gameId, query) {
        return this.leaderboardService.getGameLeaderboard(gameId, query);
    }
    async getGameStats(gameId) {
        const stats = await this.leaderboardService.getGameStats(gameId);
        if (!stats) {
            throw new common_1.NotFoundException('Game not found');
        }
        return stats;
    }
    async getPlatformStats() {
        return this.leaderboardService.getPlatformStats();
    }
    async getMyRank(userId) {
        return this.leaderboardService.getUserRank(userId);
    }
    async getMyGameRank(userId, gameId) {
        return this.leaderboardService.getUserRank(userId, gameId);
    }
    async getUserRank(userId) {
        return this.leaderboardService.getUserRank(userId);
    }
};
exports.LeaderboardController = LeaderboardController;
__decorate([
    (0, common_1.Get)('global'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get global leaderboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: leaderboard_dto_1.LeaderboardResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/leaderboard.dto").LeaderboardResponseDto }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leaderboard_dto_1.LeaderboardQueryDto]),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "getGlobalLeaderboard", null);
__decorate([
    (0, common_1.Get)('game/:gameId'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get game-specific leaderboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: leaderboard_dto_1.LeaderboardResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/leaderboard.dto").LeaderboardResponseDto }),
    __param(0, (0, common_1.Param)('gameId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, leaderboard_dto_1.LeaderboardQueryDto]),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "getGameLeaderboard", null);
__decorate([
    (0, common_1.Get)('game/:gameId/stats'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get game statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: leaderboard_dto_1.GameStatsDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/leaderboard.dto").GameStatsDto }),
    __param(0, (0, common_1.Param)('gameId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "getGameStats", null);
__decorate([
    (0, common_1.Get)('platform/stats'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform-wide statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: leaderboard_dto_1.PlatformStatsDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/leaderboard.dto").PlatformStatsDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "getPlatformStats", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user global rank' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: leaderboard_dto_1.UserRankDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/leaderboard.dto").UserRankDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "getMyRank", null);
__decorate([
    (0, common_1.Get)('me/game/:gameId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user rank for a game' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: leaderboard_dto_1.UserRankDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/leaderboard.dto").UserRankDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('gameId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "getMyGameRank", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user rank' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: leaderboard_dto_1.UserRankDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/leaderboard.dto").UserRankDto }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "getUserRank", null);
exports.LeaderboardController = LeaderboardController = __decorate([
    (0, swagger_1.ApiTags)('Leaderboard'),
    (0, common_1.Controller)('leaderboard'),
    __metadata("design:paramtypes", [leaderboard_service_1.LeaderboardService])
], LeaderboardController);
//# sourceMappingURL=leaderboard.controller.js.map