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
exports.UsersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const users_dto_1 = require("./dto/users.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(userId) {
        return this.usersService.findById(userId);
    }
    async updateProfile(userId, dto) {
        return this.usersService.update(userId, dto);
    }
    async getMyStats(userId) {
        return this.usersService.getStats(userId);
    }
    async getMyWallets(userId) {
        return this.usersService.getWallets(userId);
    }
    async addWallet(userId, dto) {
        return this.usersService.addWallet(userId, dto.walletAddress, dto.chain, dto.walletType);
    }
    async removeWallet(userId, walletId) {
        await this.usersService.removeWallet(userId, walletId);
    }
    async getUserByUsername(username) {
        return this.usersService.findByUsername(username);
    }
    async getUserById(id) {
        return this.usersService.findById(id);
    }
    async getUserStats(id) {
        return this.usersService.getStats(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get current user profile", summary: 'Get current user profile' }),
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiResponse)({ status: 200, type: users_dto_1.UserResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/users.dto").UserResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Update current user profile", summary: 'Update current user profile' }),
    (0, common_1.Put)('me'),
    (0, swagger_1.ApiResponse)({ status: 200, type: users_dto_1.UserResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/users.dto").UserResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get current user stats", summary: 'Get current user statistics' }),
    (0, common_1.Get)('me/stats'),
    (0, swagger_1.ApiResponse)({ status: 200, type: users_dto_1.UserStatsDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/users.dto").UserStatsDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyStats", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get current user's wallets", summary: 'Get current user wallets' }),
    (0, common_1.Get)('me/wallets'),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyWallets", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Add wallet to current user", summary: 'Add wallet to current user' }),
    (0, common_1.Post)('me/wallets'),
    (0, swagger_1.ApiResponse)({ status: 201 }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_dto_1.AddWalletDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addWallet", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Remove wallet from current user", summary: 'Remove wallet from current user' }),
    (0, common_1.Delete)('me/wallets/:walletId'),
    (0, swagger_1.ApiResponse)({ status: 204 }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('walletId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeWallet", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get user by username (public profile)", summary: 'Get user by username' }),
    (0, common_1.Get)('username/:username'),
    (0, swagger_1.ApiResponse)({ status: 200, type: users_dto_1.UserResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/users.dto").UserResponseDto }),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserByUsername", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get user by ID (public profile)", summary: 'Get user by ID' }),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiResponse)({ status: 200, type: users_dto_1.UserResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/users.dto").UserResponseDto }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get user stats by ID", summary: 'Get user statistics' }),
    (0, common_1.Get)(':id/stats'),
    (0, swagger_1.ApiResponse)({ status: 200, type: users_dto_1.UserStatsDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/users.dto").UserStatsDto }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserStats", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map