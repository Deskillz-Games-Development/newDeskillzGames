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
exports.GameListResponseDto = exports.PaginationDto = exports.GameResponseDto = exports.DeveloperInfoDto = exports.RejectGameDto = exports.GameQueryDto = exports.UpdateGameDto = exports.CreateGameDto = exports.GameStatus = exports.GamePlatform = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var GamePlatform;
(function (GamePlatform) {
    GamePlatform["ANDROID"] = "ANDROID";
    GamePlatform["IOS"] = "IOS";
    GamePlatform["BOTH"] = "BOTH";
})(GamePlatform || (exports.GamePlatform = GamePlatform = {}));
var GameStatus;
(function (GameStatus) {
    GameStatus["DRAFT"] = "DRAFT";
    GameStatus["PENDING_REVIEW"] = "PENDING_REVIEW";
    GameStatus["APPROVED"] = "APPROVED";
    GameStatus["REJECTED"] = "REJECTED";
    GameStatus["SUSPENDED"] = "SUSPENDED";
})(GameStatus || (exports.GameStatus = GameStatus = {}));
class CreateGameDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String }, description: { required: true, type: () => String }, shortDescription: { required: false, type: () => String }, iconUrl: { required: false, type: () => String }, bannerUrl: { required: false, type: () => String }, screenshots: { required: false, type: () => [String] }, videoUrl: { required: false, type: () => String }, genre: { required: false, type: () => [String] }, tags: { required: false, type: () => [String] }, platform: { required: true, enum: require("./games.dto").GamePlatform }, androidUrl: { required: false, type: () => String }, iosUrl: { required: false, type: () => String }, minPlayers: { required: false, type: () => Number, minimum: 1, maximum: 100 }, maxPlayers: { required: false, type: () => Number, minimum: 1, maximum: 100 }, avgMatchDuration: { required: false, type: () => Number }, supportsSync: { required: false, type: () => Boolean }, supportsAsync: { required: false, type: () => Boolean }, demoEnabled: { required: false, type: () => Boolean } };
    }
}
exports.CreateGameDto = CreateGameDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Puzzle Master' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGameDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'A challenging puzzle game...' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGameDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Match colors and solve puzzles!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGameDto.prototype, "shortDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/icon.png' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGameDto.prototype, "iconUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/banner.jpg' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGameDto.prototype, "bannerUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateGameDto.prototype, "screenshots", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://youtube.com/watch?v=xxx' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGameDto.prototype, "videoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['puzzle', 'casual'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateGameDto.prototype, "genre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['strategy', 'brain'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateGameDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: GamePlatform }),
    (0, class_validator_1.IsEnum)(GamePlatform),
    __metadata("design:type", String)
], CreateGameDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://play.google.com/store/apps/details?id=xxx' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGameDto.prototype, "androidUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://apps.apple.com/app/xxx' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGameDto.prototype, "iosUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateGameDto.prototype, "minPlayers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateGameDto.prototype, "maxPlayers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 300, description: 'Average match duration in seconds' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateGameDto.prototype, "avgMatchDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateGameDto.prototype, "supportsSync", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateGameDto.prototype, "supportsAsync", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateGameDto.prototype, "demoEnabled", void 0);
class UpdateGameDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: false, type: () => String }, description: { required: false, type: () => String }, shortDescription: { required: false, type: () => String }, iconUrl: { required: false, type: () => String }, bannerUrl: { required: false, type: () => String }, screenshots: { required: false, type: () => [String] }, videoUrl: { required: false, type: () => String }, genre: { required: false, type: () => [String] }, tags: { required: false, type: () => [String] }, androidUrl: { required: false, type: () => String }, iosUrl: { required: false, type: () => String }, minPlayers: { required: false, type: () => Number, minimum: 1, maximum: 100 }, maxPlayers: { required: false, type: () => Number, minimum: 1, maximum: 100 }, avgMatchDuration: { required: false, type: () => Number }, supportsSync: { required: false, type: () => Boolean }, supportsAsync: { required: false, type: () => Boolean }, demoEnabled: { required: false, type: () => Boolean } };
    }
}
exports.UpdateGameDto = UpdateGameDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGameDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGameDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGameDto.prototype, "shortDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGameDto.prototype, "iconUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGameDto.prototype, "bannerUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateGameDto.prototype, "screenshots", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGameDto.prototype, "videoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateGameDto.prototype, "genre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateGameDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGameDto.prototype, "androidUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGameDto.prototype, "iosUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateGameDto.prototype, "minPlayers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateGameDto.prototype, "maxPlayers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateGameDto.prototype, "avgMatchDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateGameDto.prototype, "supportsSync", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateGameDto.prototype, "supportsAsync", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateGameDto.prototype, "demoEnabled", void 0);
class GameQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { page: { required: false, type: () => Number, minimum: 1 }, limit: { required: false, type: () => Number, minimum: 1, maximum: 100 }, status: { required: false, enum: require("./games.dto").GameStatus }, genre: { required: false, type: () => String }, platform: { required: false, enum: require("./games.dto").GamePlatform }, search: { required: false, type: () => String }, developerId: { required: false, type: () => String }, sortBy: { required: false, type: () => String }, sortOrder: { required: false, type: () => Object } };
    }
}
exports.GameQueryDto = GameQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GameQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GameQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: GameStatus }),
    (0, class_validator_1.IsEnum)(GameStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GameQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GameQueryDto.prototype, "genre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: GamePlatform }),
    (0, class_validator_1.IsEnum)(GamePlatform),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GameQueryDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GameQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GameQueryDto.prototype, "developerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'createdAt' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GameQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'desc' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GameQueryDto.prototype, "sortOrder", void 0);
class RejectGameDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { reason: { required: true, type: () => String } };
    }
}
exports.RejectGameDto = RejectGameDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Game violates content guidelines' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectGameDto.prototype, "reason", void 0);
class DeveloperInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, username: { required: true, type: () => String }, displayName: { required: false, type: () => String } };
    }
}
exports.DeveloperInfoDto = DeveloperInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DeveloperInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DeveloperInfoDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], DeveloperInfoDto.prototype, "displayName", void 0);
class GameResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, developerId: { required: true, type: () => String }, developer: { required: true, type: () => require("./games.dto").DeveloperInfoDto }, name: { required: true, type: () => String }, slug: { required: true, type: () => String }, description: { required: true, type: () => String }, shortDescription: { required: false, type: () => String }, iconUrl: { required: false, type: () => String }, bannerUrl: { required: false, type: () => String }, screenshots: { required: true, type: () => [String] }, videoUrl: { required: false, type: () => String }, genre: { required: true, type: () => [String] }, tags: { required: true, type: () => [String] }, platform: { required: true, type: () => String }, androidUrl: { required: false, type: () => String }, iosUrl: { required: false, type: () => String }, minPlayers: { required: true, type: () => Number }, maxPlayers: { required: true, type: () => Number }, avgMatchDuration: { required: false, type: () => Number }, supportsSync: { required: true, type: () => Boolean }, supportsAsync: { required: true, type: () => Boolean }, demoEnabled: { required: true, type: () => Boolean }, status: { required: true, type: () => String }, totalMatches: { required: true, type: () => Number }, totalPlayers: { required: true, type: () => Number }, avgRating: { required: true, type: () => Number }, ratingCount: { required: true, type: () => Number }, tournamentsCount: { required: true, type: () => Number }, createdAt: { required: true, type: () => Date }, approvedAt: { required: false, type: () => Date }, launchedAt: { required: false, type: () => Date } };
    }
}
exports.GameResponseDto = GameResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameResponseDto.prototype, "developerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: DeveloperInfoDto }),
    __metadata("design:type", DeveloperInfoDto)
], GameResponseDto.prototype, "developer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameResponseDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], GameResponseDto.prototype, "shortDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], GameResponseDto.prototype, "iconUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], GameResponseDto.prototype, "bannerUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], GameResponseDto.prototype, "screenshots", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], GameResponseDto.prototype, "videoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], GameResponseDto.prototype, "genre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], GameResponseDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: GamePlatform }),
    __metadata("design:type", String)
], GameResponseDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], GameResponseDto.prototype, "androidUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], GameResponseDto.prototype, "iosUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameResponseDto.prototype, "minPlayers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameResponseDto.prototype, "maxPlayers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], GameResponseDto.prototype, "avgMatchDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], GameResponseDto.prototype, "supportsSync", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], GameResponseDto.prototype, "supportsAsync", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], GameResponseDto.prototype, "demoEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: GameStatus }),
    __metadata("design:type", String)
], GameResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameResponseDto.prototype, "totalMatches", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameResponseDto.prototype, "totalPlayers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameResponseDto.prototype, "avgRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameResponseDto.prototype, "ratingCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameResponseDto.prototype, "tournamentsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], GameResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], GameResponseDto.prototype, "approvedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], GameResponseDto.prototype, "launchedAt", void 0);
class PaginationDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { page: { required: true, type: () => Number }, limit: { required: true, type: () => Number }, total: { required: true, type: () => Number }, totalPages: { required: true, type: () => Number } };
    }
}
exports.PaginationDto = PaginationDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginationDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginationDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginationDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginationDto.prototype, "totalPages", void 0);
class GameListResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { games: { required: true, type: () => [require("./games.dto").GameResponseDto] }, pagination: { required: true, type: () => require("./games.dto").PaginationDto } };
    }
}
exports.GameListResponseDto = GameListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [GameResponseDto] }),
    __metadata("design:type", Array)
], GameListResponseDto.prototype, "games", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PaginationDto }),
    __metadata("design:type", PaginationDto)
], GameListResponseDto.prototype, "pagination", void 0);
//# sourceMappingURL=games.dto.js.map