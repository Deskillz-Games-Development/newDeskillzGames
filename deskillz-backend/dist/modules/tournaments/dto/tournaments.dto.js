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
exports.TournamentListResponseDto = exports.PaginationDto = exports.LeaderboardEntryDto = exports.TournamentEntryResponseDto = exports.TournamentResponseDto = exports.UserInfoDto = exports.GameInfoDto = exports.SubmitScoreDto = exports.JoinTournamentDto = exports.TournamentQueryDto = exports.CreateTournamentDto = exports.EntryStatus = exports.CryptoCurrency = exports.TournamentStatus = exports.TournamentMode = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var TournamentMode;
(function (TournamentMode) {
    TournamentMode["SYNC"] = "SYNC";
    TournamentMode["ASYNC"] = "ASYNC";
})(TournamentMode || (exports.TournamentMode = TournamentMode = {}));
var TournamentStatus;
(function (TournamentStatus) {
    TournamentStatus["SCHEDULED"] = "SCHEDULED";
    TournamentStatus["OPEN"] = "OPEN";
    TournamentStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TournamentStatus["COMPLETED"] = "COMPLETED";
    TournamentStatus["CANCELLED"] = "CANCELLED";
})(TournamentStatus || (exports.TournamentStatus = TournamentStatus = {}));
var CryptoCurrency;
(function (CryptoCurrency) {
    CryptoCurrency["ETH"] = "ETH";
    CryptoCurrency["BTC"] = "BTC";
    CryptoCurrency["BNB"] = "BNB";
    CryptoCurrency["SOL"] = "SOL";
    CryptoCurrency["XRP"] = "XRP";
    CryptoCurrency["USDT_ETH"] = "USDT_ETH";
    CryptoCurrency["USDT_TRON"] = "USDT_TRON";
    CryptoCurrency["USDT_BSC"] = "USDT_BSC";
    CryptoCurrency["USDC_ETH"] = "USDC_ETH";
    CryptoCurrency["USDC_POLYGON"] = "USDC_POLYGON";
    CryptoCurrency["USDC_ARB"] = "USDC_ARB";
    CryptoCurrency["USDC_BASE"] = "USDC_BASE";
})(CryptoCurrency || (exports.CryptoCurrency = CryptoCurrency = {}));
var EntryStatus;
(function (EntryStatus) {
    EntryStatus["PENDING"] = "PENDING";
    EntryStatus["CONFIRMED"] = "CONFIRMED";
    EntryStatus["PLAYING"] = "PLAYING";
    EntryStatus["COMPLETED"] = "COMPLETED";
    EntryStatus["FORFEITED"] = "FORFEITED";
    EntryStatus["REFUNDED"] = "REFUNDED";
})(EntryStatus || (exports.EntryStatus = EntryStatus = {}));
class CreateTournamentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { gameId: { required: true, type: () => String }, name: { required: true, type: () => String }, description: { required: false, type: () => String }, mode: { required: true, enum: require("./tournaments.dto").TournamentMode }, entryFee: { required: true, type: () => Number, minimum: 0 }, entryCurrency: { required: true, enum: require("./tournaments.dto").CryptoCurrency }, prizePool: { required: true, type: () => Number, minimum: 0 }, prizeCurrency: { required: true, enum: require("./tournaments.dto").CryptoCurrency }, minPlayers: { required: false, type: () => Number, minimum: 2 }, maxPlayers: { required: true, type: () => Number, minimum: 2, maximum: 10000 }, prizeDistribution: { required: true, type: () => Object }, scheduledStart: { required: true, type: () => String }, scheduledEnd: { required: false, type: () => String }, matchDuration: { required: false, type: () => Number }, roundsCount: { required: false, type: () => Number, minimum: 1 }, platformFeePercent: { required: false, type: () => Number, minimum: 0, maximum: 50 } };
    }
}
exports.CreateTournamentDto = CreateTournamentDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "gameId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Weekend Championship' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: TournamentMode }),
    (0, class_validator_1.IsEnum)(TournamentMode),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "mode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTournamentDto.prototype, "entryFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CryptoCurrency }),
    (0, class_validator_1.IsEnum)(CryptoCurrency),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "entryCurrency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTournamentDto.prototype, "prizePool", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CryptoCurrency }),
    (0, class_validator_1.IsEnum)(CryptoCurrency),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "prizeCurrency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTournamentDto.prototype, "minPlayers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2),
    (0, class_validator_1.Max)(10000),
    __metadata("design:type", Number)
], CreateTournamentDto.prototype, "maxPlayers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { '1': 50, '2': 30, '3': 20 },
        description: 'Prize distribution by rank (percentages)',
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateTournamentDto.prototype, "prizeDistribution", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-12-15T18:00:00Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "scheduledStart", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-12-15T22:00:00Z' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "scheduledEnd", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 300, description: 'Match duration in seconds' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTournamentDto.prototype, "matchDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTournamentDto.prototype, "roundsCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTournamentDto.prototype, "platformFeePercent", void 0);
class TournamentQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { page: { required: false, type: () => Number, minimum: 1 }, limit: { required: false, type: () => Number, minimum: 1, maximum: 100 }, status: { required: false, enum: require("./tournaments.dto").TournamentStatus }, mode: { required: false, enum: require("./tournaments.dto").TournamentMode }, gameId: { required: false, type: () => String }, minEntryFee: { required: false, type: () => Number }, maxEntryFee: { required: false, type: () => Number }, currency: { required: false, enum: require("./tournaments.dto").CryptoCurrency }, sortBy: { required: false, type: () => String }, sortOrder: { required: false, type: () => Object } };
    }
}
exports.TournamentQueryDto = TournamentQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], TournamentQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], TournamentQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: TournamentStatus }),
    (0, class_validator_1.IsEnum)(TournamentStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TournamentQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: TournamentMode }),
    (0, class_validator_1.IsEnum)(TournamentMode),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TournamentQueryDto.prototype, "mode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TournamentQueryDto.prototype, "gameId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], TournamentQueryDto.prototype, "minEntryFee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], TournamentQueryDto.prototype, "maxEntryFee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: CryptoCurrency }),
    (0, class_validator_1.IsEnum)(CryptoCurrency),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TournamentQueryDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'scheduledStart' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TournamentQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'asc' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TournamentQueryDto.prototype, "sortOrder", void 0);
class JoinTournamentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { txHash: { required: false, type: () => String } };
    }
}
exports.JoinTournamentDto = JoinTournamentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transaction hash for entry payment' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], JoinTournamentDto.prototype, "txHash", void 0);
class SubmitScoreDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { score: { required: true, type: () => Number, minimum: 0 }, metadata: { required: false, type: () => Object }, signature: { required: false, type: () => String } };
    }
}
exports.SubmitScoreDto = SubmitScoreDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15000 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SubmitScoreDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Game-specific metadata' }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SubmitScoreDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SDK-signed score signature' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitScoreDto.prototype, "signature", void 0);
class GameInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, slug: { required: true, type: () => String }, iconUrl: { required: false, type: () => String } };
    }
}
exports.GameInfoDto = GameInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameInfoDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameInfoDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], GameInfoDto.prototype, "iconUrl", void 0);
class UserInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, username: { required: true, type: () => String }, displayName: { required: false, type: () => String }, avatarUrl: { required: false, type: () => String } };
    }
}
exports.UserInfoDto = UserInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserInfoDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserInfoDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserInfoDto.prototype, "avatarUrl", void 0);
class TournamentResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, gameId: { required: true, type: () => String }, game: { required: true, type: () => require("./tournaments.dto").GameInfoDto }, name: { required: true, type: () => String }, description: { required: false, type: () => String }, mode: { required: true, type: () => String }, entryFee: { required: true, type: () => String }, entryCurrency: { required: true, type: () => String }, prizePool: { required: true, type: () => String }, prizeCurrency: { required: true, type: () => String }, minPlayers: { required: true, type: () => Number }, maxPlayers: { required: true, type: () => Number }, currentPlayers: { required: true, type: () => Number }, prizeDistribution: { required: true, type: () => Object }, scheduledStart: { required: true, type: () => Date }, scheduledEnd: { required: false, type: () => Date }, actualStart: { required: false, type: () => Date }, actualEnd: { required: false, type: () => Date }, matchDuration: { required: false, type: () => Number }, roundsCount: { required: true, type: () => Number }, status: { required: true, type: () => String }, platformFeePercent: { required: true, type: () => Number }, entriesCount: { required: true, type: () => Number }, createdAt: { required: true, type: () => Date } };
    }
}
exports.TournamentResponseDto = TournamentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TournamentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TournamentResponseDto.prototype, "gameId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: GameInfoDto }),
    __metadata("design:type", GameInfoDto)
], TournamentResponseDto.prototype, "game", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TournamentResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TournamentResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: TournamentMode }),
    __metadata("design:type", String)
], TournamentResponseDto.prototype, "mode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TournamentResponseDto.prototype, "entryFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CryptoCurrency }),
    __metadata("design:type", String)
], TournamentResponseDto.prototype, "entryCurrency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TournamentResponseDto.prototype, "prizePool", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CryptoCurrency }),
    __metadata("design:type", String)
], TournamentResponseDto.prototype, "prizeCurrency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TournamentResponseDto.prototype, "minPlayers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TournamentResponseDto.prototype, "maxPlayers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TournamentResponseDto.prototype, "currentPlayers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], TournamentResponseDto.prototype, "prizeDistribution", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], TournamentResponseDto.prototype, "scheduledStart", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], TournamentResponseDto.prototype, "scheduledEnd", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], TournamentResponseDto.prototype, "actualStart", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], TournamentResponseDto.prototype, "actualEnd", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], TournamentResponseDto.prototype, "matchDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TournamentResponseDto.prototype, "roundsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: TournamentStatus }),
    __metadata("design:type", String)
], TournamentResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TournamentResponseDto.prototype, "platformFeePercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TournamentResponseDto.prototype, "entriesCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], TournamentResponseDto.prototype, "createdAt", void 0);
class TournamentEntryResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, tournamentId: { required: true, type: () => String }, tournament: { required: false, type: () => require("./tournaments.dto").TournamentResponseDto }, userId: { required: true, type: () => String }, user: { required: true, type: () => require("./tournaments.dto").UserInfoDto }, entryAmount: { required: true, type: () => String }, entryCurrency: { required: true, type: () => String }, entryTxHash: { required: false, type: () => String }, status: { required: true, type: () => String }, finalRank: { required: false, type: () => Number }, prizeWon: { required: false, type: () => String }, prizeTxHash: { required: false, type: () => String }, joinedAt: { required: true, type: () => Date }, startedAt: { required: false, type: () => Date }, completedAt: { required: false, type: () => Date } };
    }
}
exports.TournamentEntryResponseDto = TournamentEntryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TournamentEntryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TournamentEntryResponseDto.prototype, "tournamentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: TournamentResponseDto }),
    __metadata("design:type", TournamentResponseDto)
], TournamentEntryResponseDto.prototype, "tournament", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TournamentEntryResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: UserInfoDto }),
    __metadata("design:type", UserInfoDto)
], TournamentEntryResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TournamentEntryResponseDto.prototype, "entryAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CryptoCurrency }),
    __metadata("design:type", String)
], TournamentEntryResponseDto.prototype, "entryCurrency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TournamentEntryResponseDto.prototype, "entryTxHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: EntryStatus }),
    __metadata("design:type", String)
], TournamentEntryResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], TournamentEntryResponseDto.prototype, "finalRank", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TournamentEntryResponseDto.prototype, "prizeWon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TournamentEntryResponseDto.prototype, "prizeTxHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], TournamentEntryResponseDto.prototype, "joinedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], TournamentEntryResponseDto.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], TournamentEntryResponseDto.prototype, "completedAt", void 0);
class LeaderboardEntryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { rank: { required: true, type: () => Number }, userId: { required: true, type: () => String }, username: { required: true, type: () => String }, displayName: { required: false, type: () => String }, avatarUrl: { required: false, type: () => String }, score: { required: true, type: () => Number }, submittedAt: { required: true, type: () => Date } };
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
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LeaderboardEntryDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], LeaderboardEntryDto.prototype, "submittedAt", void 0);
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
class TournamentListResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { tournaments: { required: true, type: () => [require("./tournaments.dto").TournamentResponseDto] }, pagination: { required: true, type: () => require("./tournaments.dto").PaginationDto } };
    }
}
exports.TournamentListResponseDto = TournamentListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [TournamentResponseDto] }),
    __metadata("design:type", Array)
], TournamentListResponseDto.prototype, "tournaments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PaginationDto }),
    __metadata("design:type", PaginationDto)
], TournamentListResponseDto.prototype, "pagination", void 0);
//# sourceMappingURL=tournaments.dto.js.map