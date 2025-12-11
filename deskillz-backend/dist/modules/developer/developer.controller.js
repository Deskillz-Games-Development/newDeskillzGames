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
exports.DeveloperController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const developer_service_1 = require("./developer.service");
const developer_dto_1 = require("./dto/developer.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let DeveloperController = class DeveloperController {
    constructor(developerService) {
        this.developerService = developerService;
    }
    async getDashboard(userId) {
        return this.developerService.getDashboard(userId);
    }
    async getGameAnalytics(userId, gameId) {
        return this.developerService.getGameAnalytics(userId, gameId);
    }
    async getRevenueReport(userId, startDate, endDate) {
        return this.developerService.getRevenueReport(userId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    async generateSdkKey(userId, dto) {
        return this.developerService.generateSdkKey(userId, dto);
    }
    async listSdkKeys(userId) {
        return this.developerService.listSdkKeys(userId);
    }
    async revokeSdkKey(userId, apiKey) {
        await this.developerService.revokeSdkKey(userId, apiKey);
    }
    async requestPayout(userId, dto) {
        return this.developerService.requestPayout(userId, dto);
    }
    async upgradeToDeveloper(userId) {
        await this.developerService.upgradeToDeveloper(userId);
    }
};
exports.DeveloperController = DeveloperController;
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get developer dashboard", summary: 'Get developer dashboard overview' }),
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiResponse)({ status: 200, type: developer_dto_1.DeveloperDashboardDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/developer.dto").DeveloperDashboardDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeveloperController.prototype, "getDashboard", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get game analytics", summary: 'Get detailed game analytics' }),
    (0, common_1.Get)('games/:gameId/analytics'),
    (0, swagger_1.ApiResponse)({ status: 200, type: developer_dto_1.GameAnalyticsDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/developer.dto").GameAnalyticsDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('gameId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DeveloperController.prototype, "getGameAnalytics", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get revenue report", summary: 'Get revenue report' }),
    (0, common_1.Get)('revenue'),
    (0, swagger_1.ApiResponse)({ status: 200, type: developer_dto_1.RevenueReportDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/developer.dto").RevenueReportDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DeveloperController.prototype, "getRevenueReport", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Generate SDK API key", summary: 'Generate SDK API key' }),
    (0, common_1.Post)('sdk-keys'),
    (0, swagger_1.ApiResponse)({ status: 201, type: developer_dto_1.SdkKeyDto }),
    openapi.ApiResponse({ status: 201, type: require("./dto/developer.dto").SdkKeyDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, developer_dto_1.CreateSdkKeyDto]),
    __metadata("design:returntype", Promise)
], DeveloperController.prototype, "generateSdkKey", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "List SDK keys", summary: 'List SDK API keys' }),
    (0, common_1.Get)('sdk-keys'),
    (0, swagger_1.ApiResponse)({ status: 200, type: [developer_dto_1.SdkKeyDto] }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeveloperController.prototype, "listSdkKeys", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Revoke SDK key", summary: 'Revoke SDK API key' }),
    (0, common_1.Delete)('sdk-keys/:apiKey'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiResponse)({ status: 204 }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('apiKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DeveloperController.prototype, "revokeSdkKey", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Request payout", summary: 'Request developer payout' }),
    (0, common_1.Post)('payouts'),
    (0, swagger_1.ApiResponse)({ status: 201, type: developer_dto_1.PayoutResponseDto }),
    openapi.ApiResponse({ status: 201, type: require("./dto/developer.dto").PayoutResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, developer_dto_1.PayoutRequestDto]),
    __metadata("design:returntype", Promise)
], DeveloperController.prototype, "requestPayout", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Upgrade to developer (for players who want to become developers)", summary: 'Upgrade account to developer' }),
    (0, common_1.Post)('upgrade'),
    (0, roles_decorator_1.Roles)('PLAYER', 'DEVELOPER', 'ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account upgraded to developer' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeveloperController.prototype, "upgradeToDeveloper", null);
exports.DeveloperController = DeveloperController = __decorate([
    (0, swagger_1.ApiTags)('Developer'),
    (0, common_1.Controller)('developer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('DEVELOPER', 'ADMIN'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [developer_service_1.DeveloperService])
], DeveloperController);
//# sourceMappingURL=developer.controller.js.map