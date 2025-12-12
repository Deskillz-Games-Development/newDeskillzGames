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
exports.DeveloperSettingsDto = exports.PayoutResponseDto = exports.SdkKeyDto = exports.RevenueReportDto = exports.PayoutHistoryDto = exports.GameRevenueDto = exports.GameAnalyticsDto = exports.DeveloperDashboardDto = exports.RecentActivityDto = exports.GameSummaryDto = exports.UpdateDeveloperSettingsDto = exports.PayoutRequestDto = exports.CreateSdkKeyDto = exports.SdkEnvironment = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var SdkEnvironment;
(function (SdkEnvironment) {
    SdkEnvironment["DEVELOPMENT"] = "development";
    SdkEnvironment["STAGING"] = "staging";
    SdkEnvironment["PRODUCTION"] = "production";
})(SdkEnvironment || (exports.SdkEnvironment = SdkEnvironment = {}));
class CreateSdkKeyDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { gameId: { required: true, type: () => String }, name: { required: true, type: () => String }, environment: { required: false, enum: require("./developer.dto").SdkEnvironment } };
    }
}
exports.CreateSdkKeyDto = CreateSdkKeyDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSdkKeyDto.prototype, "gameId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Production Key' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSdkKeyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: SdkEnvironment }),
    (0, class_validator_1.IsEnum)(SdkEnvironment),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSdkKeyDto.prototype, "environment", void 0);
class PayoutRequestDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { amount: { required: true, type: () => Number, minimum: 10 }, currency: { required: true, type: () => String }, walletAddress: { required: true, type: () => String }, chain: { required: true, type: () => String } };
    }
}
exports.PayoutRequestDto = PayoutRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(10),
    __metadata("design:type", Number)
], PayoutRequestDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USDT_TRON' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayoutRequestDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TAddress...' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayoutRequestDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'tron' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayoutRequestDto.prototype, "chain", void 0);
class UpdateDeveloperSettingsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { companyName: { required: false, type: () => String }, website: { required: false, type: () => String }, supportEmail: { required: false, type: () => String }, defaultPayoutWallet: { required: false, type: () => String }, defaultPayoutChain: { required: false, type: () => String } };
    }
}
exports.UpdateDeveloperSettingsDto = UpdateDeveloperSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDeveloperSettingsDto.prototype, "companyName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDeveloperSettingsDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDeveloperSettingsDto.prototype, "supportEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDeveloperSettingsDto.prototype, "defaultPayoutWallet", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDeveloperSettingsDto.prototype, "defaultPayoutChain", void 0);
class GameSummaryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, status: { required: true, type: () => String }, totalMatches: { required: true, type: () => Number }, totalPlayers: { required: true, type: () => Number }, revenue: { required: true, type: () => String }, tournamentsCount: { required: true, type: () => Number } };
    }
}
exports.GameSummaryDto = GameSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameSummaryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameSummaryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameSummaryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameSummaryDto.prototype, "totalMatches", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameSummaryDto.prototype, "totalPlayers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameSummaryDto.prototype, "revenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameSummaryDto.prototype, "tournamentsCount", void 0);
class RecentActivityDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { type: { required: true, type: () => String }, gameName: { required: true, type: () => String }, tournamentName: { required: true, type: () => String }, players: { required: true, type: () => Number }, status: { required: true, type: () => String }, createdAt: { required: true, type: () => Date } };
    }
}
exports.RecentActivityDto = RecentActivityDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RecentActivityDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RecentActivityDto.prototype, "gameName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RecentActivityDto.prototype, "tournamentName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RecentActivityDto.prototype, "players", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RecentActivityDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], RecentActivityDto.prototype, "createdAt", void 0);
class DeveloperDashboardDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { totalGames: { required: true, type: () => Number }, approvedGames: { required: true, type: () => Number }, pendingGames: { required: true, type: () => Number }, totalMatches: { required: true, type: () => Number }, totalPlayers: { required: true, type: () => Number }, totalRevenue: { required: true, type: () => String }, pendingPayouts: { required: true, type: () => String }, activeTournaments: { required: true, type: () => Number }, games: { required: true, type: () => [require("./developer.dto").GameSummaryDto] }, recentActivity: { required: true, type: () => [require("./developer.dto").RecentActivityDto] } };
    }
}
exports.DeveloperDashboardDto = DeveloperDashboardDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DeveloperDashboardDto.prototype, "totalGames", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DeveloperDashboardDto.prototype, "approvedGames", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DeveloperDashboardDto.prototype, "pendingGames", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DeveloperDashboardDto.prototype, "totalMatches", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DeveloperDashboardDto.prototype, "totalPlayers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DeveloperDashboardDto.prototype, "totalRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DeveloperDashboardDto.prototype, "pendingPayouts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DeveloperDashboardDto.prototype, "activeTournaments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [GameSummaryDto] }),
    __metadata("design:type", Array)
], DeveloperDashboardDto.prototype, "games", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [RecentActivityDto] }),
    __metadata("design:type", Array)
], DeveloperDashboardDto.prototype, "recentActivity", void 0);
class GameAnalyticsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { gameId: { required: true, type: () => String }, gameName: { required: true, type: () => String }, status: { required: true, type: () => String }, totalMatches: { required: true, type: () => Number }, totalPlayers: { required: true, type: () => Number }, totalRevenue: { required: true, type: () => String }, averageRating: { required: true, type: () => Number }, tournamentsByStatus: { required: true, type: () => Object }, playersLast7Days: { required: true, type: () => Number }, playersLast30Days: { required: true, type: () => Number }, retentionRate: { required: true, type: () => Number }, averageScore: { required: true, type: () => Number }, highestScore: { required: true, type: () => Number }, lowestScore: { required: true, type: () => Number } };
    }
}
exports.GameAnalyticsDto = GameAnalyticsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameAnalyticsDto.prototype, "gameId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameAnalyticsDto.prototype, "gameName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameAnalyticsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameAnalyticsDto.prototype, "totalMatches", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameAnalyticsDto.prototype, "totalPlayers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameAnalyticsDto.prototype, "totalRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameAnalyticsDto.prototype, "averageRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], GameAnalyticsDto.prototype, "tournamentsByStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameAnalyticsDto.prototype, "playersLast7Days", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameAnalyticsDto.prototype, "playersLast30Days", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameAnalyticsDto.prototype, "retentionRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameAnalyticsDto.prototype, "averageScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameAnalyticsDto.prototype, "highestScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameAnalyticsDto.prototype, "lowestScore", void 0);
class GameRevenueDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { gameId: { required: true, type: () => String }, gameName: { required: true, type: () => String }, totalRevenue: { required: true, type: () => Number }, tournamentsCompleted: { required: true, type: () => Number } };
    }
}
exports.GameRevenueDto = GameRevenueDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameRevenueDto.prototype, "gameId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GameRevenueDto.prototype, "gameName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameRevenueDto.prototype, "totalRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GameRevenueDto.prototype, "tournamentsCompleted", void 0);
class PayoutHistoryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, amount: { required: true, type: () => String }, currency: { required: true, type: () => String }, status: { required: true, type: () => String }, txHash: { required: false, type: () => String }, createdAt: { required: true, type: () => Date }, completedAt: { required: false, type: () => Date } };
    }
}
exports.PayoutHistoryDto = PayoutHistoryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PayoutHistoryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PayoutHistoryDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PayoutHistoryDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PayoutHistoryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], PayoutHistoryDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], PayoutHistoryDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], PayoutHistoryDto.prototype, "completedAt", void 0);
class RevenueReportDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { developerId: { required: true, type: () => String }, period: { required: true, type: () => ({ start: { required: true, type: () => Date, nullable: true }, end: { required: true, type: () => Date, nullable: true } }) }, totalRevenue: { required: true, type: () => String }, revenueByGame: { required: true, type: () => [require("./developer.dto").GameRevenueDto] }, totalTournamentsCompleted: { required: true, type: () => Number }, recentPayouts: { required: true, type: () => [require("./developer.dto").PayoutHistoryDto] } };
    }
}
exports.RevenueReportDto = RevenueReportDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RevenueReportDto.prototype, "developerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], RevenueReportDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RevenueReportDto.prototype, "totalRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [GameRevenueDto] }),
    __metadata("design:type", Array)
], RevenueReportDto.prototype, "revenueByGame", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RevenueReportDto.prototype, "totalTournamentsCompleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PayoutHistoryDto] }),
    __metadata("design:type", Array)
], RevenueReportDto.prototype, "recentPayouts", void 0);
class SdkKeyDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { apiKey: { required: true, type: () => String }, apiSecret: { required: false, type: () => String }, gameId: { required: true, type: () => String }, name: { required: true, type: () => String }, environment: { required: true, type: () => String }, createdAt: { required: true, type: () => Date } };
    }
}
exports.SdkKeyDto = SdkKeyDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SdkKeyDto.prototype, "apiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], SdkKeyDto.prototype, "apiSecret", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SdkKeyDto.prototype, "gameId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SdkKeyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SdkKeyDto.prototype, "environment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], SdkKeyDto.prototype, "createdAt", void 0);
class PayoutResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, amount: { required: true, type: () => String }, currency: { required: true, type: () => String }, walletAddress: { required: true, type: () => String }, status: { required: true, type: () => String }, estimatedArrival: { required: true, type: () => Date }, createdAt: { required: true, type: () => Date } };
    }
}
exports.PayoutResponseDto = PayoutResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PayoutResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PayoutResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PayoutResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PayoutResponseDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PayoutResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], PayoutResponseDto.prototype, "estimatedArrival", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], PayoutResponseDto.prototype, "createdAt", void 0);
class DeveloperSettingsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { companyName: { required: false, type: () => String }, website: { required: false, type: () => String }, supportEmail: { required: false, type: () => String }, defaultPayoutWallet: { required: false, type: () => String }, defaultPayoutChain: { required: false, type: () => String } };
    }
}
exports.DeveloperSettingsDto = DeveloperSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], DeveloperSettingsDto.prototype, "companyName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], DeveloperSettingsDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], DeveloperSettingsDto.prototype, "supportEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], DeveloperSettingsDto.prototype, "defaultPayoutWallet", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], DeveloperSettingsDto.prototype, "defaultPayoutChain", void 0);
//# sourceMappingURL=developer.dto.js.map