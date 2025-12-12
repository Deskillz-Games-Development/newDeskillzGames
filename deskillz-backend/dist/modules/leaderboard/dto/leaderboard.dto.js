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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformStatsDto = exports.GameStatsDto = exports.UserRankDto = exports.LeaderboardResponseDto = exports.LeaderboardEntryDto = exports.LeaderboardQueryDto = exports.LeaderboardPeriod = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var LeaderboardPeriod;
(function (LeaderboardPeriod) {
    LeaderboardPeriod["DAILY"] = "daily";
    LeaderboardPeriod["WEEKLY"] = "weekly";
    LeaderboardPeriod["MONTHLY"] = "monthly";
    LeaderboardPeriod["ALL_TIME"] = "all_time";
})(LeaderboardPeriod || (exports.LeaderboardPeriod = LeaderboardPeriod = {}));
class LeaderboardQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { period: { required: false, type: () => String }, limit: { required: false, type: () => Number, minimum: 1, maximum: 500 }, offset: { required: false, type: () => Number, minimum: 0 } };
    }
}
exports.LeaderboardQueryDto = LeaderboardQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: LeaderboardPeriod, default: 'all_time' }),
    (0, class_validator_1.IsEnum)(LeaderboardPeriod),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeaderboardQueryDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 100 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(500),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LeaderboardQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LeaderboardQueryDto.prototype, "offset", void 0);
class LeaderboardEntryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { rank: { required: true, type: () => Number }, userId: { required: true, type: () => String }, username: { required: true, type: () => String }, displayName: { required: false, type: () => String }, avatarUrl: { required: false, type: () => String }, wins: { required: false, type: () => Number }, matches: { required: false, type: () => Number }, earnings: { required: false, type: () => String }, totalScore: { required: false, type: () => Number }, skillRating: { required: false, type: () => Number }, winRate: { required: false, type: () => Number } };
    }
}
exports.LeaderboardEntryDto = LeaderboardEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LeaderboardEntryDto.prototype, "rank", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LeaderboardEntryDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LeaderboardEntryDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LeaderboardEntryDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LeaderboardEntryDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LeaderboardEntryDto.prototype, "wins", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LeaderboardEntryDto.prototype, "matches", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LeaderboardEntryDto.prototype, "earnings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LeaderboardEntryDto.prototype, "totalScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LeaderboardEntryDto.prototype, "skillRating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LeaderboardEntryDto.prototype, "winRate", void 0);
class LeaderboardResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { period: { required: true, type: () => String }, gameId: { required: false, type: () => String }, entries: { required: true, type: () => [require("./leaderboard.dto").LeaderboardEntryDto] }, total: { required: true, type: () => Number }, lastUpdated: { required: true, type: () => Date } };
    }
}
exports.LeaderboardResponseDto = LeaderboardResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LeaderboardResponseDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LeaderboardResponseDto.prototype, "gameId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [LeaderboardEntryDto] }),
    __metadata("design:type", Array)
], LeaderboardResponseDto.prototype, "entries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LeaderboardResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], LeaderboardResponseDto.prototype, "lastUpdated", void 0);
class UserRankDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { userId: { required: true, type: () => String }, gameId: { required: false, type: () => String }, globalRank: { required: false, type: () => Number }, gameRank: { required: false, type: () => Number }, earnings: { required: false, type: () => String }, wins: { required: false, type: () => Number }, totalScore: { required: false, type: () => Number }, message: { required: false, type: () => String } };
    }
}
exports.UserRankDto = UserRankDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserRankDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserRankDto.prototype, "gameId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], UserRankDto.prototype, "globalRank", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], UserRankDto.prototype, "gameRank", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserRankDto.prototype, "earnings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], UserRankDto.prototype, "wins", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], UserRankDto.prototype, "totalScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserRankDto.prototype, "message", void 0);
class GameStatsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { gameId: { required: true, type: () => String }, gameName: { required: true, type: () => String }, totalMatches: { required: true, type: () => Number }, totalPlayers: { required: true, type: () => Number }, averageRating: { required: true, type: () => Number }, totalRatings: { required: true, type: () => Number }, completedTournaments: { required: true, type: () => Number }, totalPrizePool: { required: true, type: () => String }, activeTournaments: { required: true, type: () => Number } };
    }
}
exports.GameStatsDto = GameStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameStatsDto.prototype, "gameId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameStatsDto.prototype, "gameName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "totalMatches", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "totalPlayers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "averageRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "totalRatings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "completedTournaments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameStatsDto.prototype, "totalPrizePool", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "activeTournaments", void 0);
class PlatformStatsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { totalUsers: { required: true, type: () => Number }, activeUsers: { required: true, type: () => Number }, totalGames: { required: true, type: () => Number }, totalTournaments: { required: true, type: () => Number }, completedTournaments: { required: true, type: () => Number }, activeTournaments: { required: true, type: () => Number }, totalPrizeDistributed: { required: true, type: () => String }, lastUpdated: { required: true, type: () => Date } };
    }
}
exports.PlatformStatsDto = PlatformStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PlatformStatsDto.prototype, "totalUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PlatformStatsDto.prototype, "activeUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PlatformStatsDto.prototype, "totalGames", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PlatformStatsDto.prototype, "totalTournaments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PlatformStatsDto.prototype, "completedTournaments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PlatformStatsDto.prototype, "activeTournaments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PlatformStatsDto.prototype, "totalPrizeDistributed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], PlatformStatsDto.prototype, "lastUpdated", void 0);
//# sourceMappingURL=leaderboard.dto.js.map