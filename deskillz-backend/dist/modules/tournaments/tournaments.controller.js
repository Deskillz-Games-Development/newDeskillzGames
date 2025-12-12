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
exports.TournamentsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tournaments_service_1 = require("./tournaments.service");
const tournaments_dto_1 = require("./dto/tournaments.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let TournamentsController = class TournamentsController {
    constructor(tournamentsService) {
        this.tournamentsService = tournamentsService;
    }
    async findAll(query) {
        return this.tournamentsService.findAll(query);
    }
    async findById(id) {
        return this.tournamentsService.findById(id);
    }
    async getLeaderboard(id) {
        return this.tournamentsService.getLeaderboard(id);
    }
    async getActiveByGame(gameId) {
        return this.tournamentsService.getActiveByGame(gameId);
    }
    async create(dto) {
        return this.tournamentsService.create(dto);
    }
    async join(id, userId, dto) {
        return this.tournamentsService.join(id, userId, dto);
    }
    async leave(id, userId) {
        await this.tournamentsService.leave(id, userId);
    }
    async submitScore(id, userId, dto) {
        await this.tournamentsService.submitScore(id, userId, dto);
    }
    async getMyEntries(userId) {
        return this.tournamentsService.getUserEntries(userId);
    }
};
exports.TournamentsController = TournamentsController;
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get all tournaments (public)", summary: 'Get all tournaments with filtering' }),
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiResponse)({ status: 200, type: tournaments_dto_1.TournamentListResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/tournaments.dto").TournamentListResponseDto }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tournaments_dto_1.TournamentQueryDto]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get tournament by ID (public)", summary: 'Get tournament by ID' }),
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiResponse)({ status: 200, type: tournaments_dto_1.TournamentResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/tournaments.dto").TournamentResponseDto }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "findById", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get tournament leaderboard (public)", summary: 'Get tournament leaderboard' }),
    (0, common_1.Get)(':id/leaderboard'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiResponse)({ status: 200, type: [tournaments_dto_1.LeaderboardEntryDto] }),
    openapi.ApiResponse({ status: 200, type: [require("./dto/tournaments.dto").LeaderboardEntryDto] }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "getLeaderboard", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get active tournaments for a game (public)", summary: 'Get active tournaments for a game' }),
    (0, common_1.Get)('game/:gameId/active'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiResponse)({ status: 200, type: [tournaments_dto_1.TournamentResponseDto] }),
    openapi.ApiResponse({ status: 200, type: [require("./dto/tournaments.dto").TournamentResponseDto] }),
    __param(0, (0, common_1.Param)('gameId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "getActiveByGame", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Create a new tournament (Admin only)", summary: 'Create a new tournament' }),
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 201, type: tournaments_dto_1.TournamentResponseDto }),
    openapi.ApiResponse({ status: 201, type: require("./dto/tournaments.dto").TournamentResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tournaments_dto_1.CreateTournamentDto]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Join a tournament", summary: 'Join a tournament' }),
    (0, common_1.Post)(':id/join'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 201, type: tournaments_dto_1.TournamentEntryResponseDto }),
    openapi.ApiResponse({ status: 201, type: require("./dto/tournaments.dto").TournamentEntryResponseDto }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, tournaments_dto_1.JoinTournamentDto]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "join", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Leave a tournament", summary: 'Leave a tournament' }),
    (0, common_1.Delete)(':id/leave'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 204 }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "leave", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Submit score for a tournament", summary: 'Submit score for a tournament' }),
    (0, common_1.Post)(':id/score'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, tournaments_dto_1.SubmitScoreDto]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "submitScore", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get current user's tournament entries", summary: 'Get current user tournament entries' }),
    (0, common_1.Get)('user/entries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 200, type: [tournaments_dto_1.TournamentEntryResponseDto] }),
    openapi.ApiResponse({ status: 200, type: [require("./dto/tournaments.dto").TournamentEntryResponseDto] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "getMyEntries", null);
exports.TournamentsController = TournamentsController = __decorate([
    (0, swagger_1.ApiTags)('Tournaments'),
    (0, common_1.Controller)('tournaments'),
    __metadata("design:paramtypes", [tournaments_service_1.TournamentsService])
], TournamentsController);
//# sourceMappingURL=tournaments.controller.js.map