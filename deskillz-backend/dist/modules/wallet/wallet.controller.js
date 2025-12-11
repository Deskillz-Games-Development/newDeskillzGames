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
exports.WalletController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const wallet_service_1 = require("./wallet.service");
const wallet_dto_1 = require("./dto/wallet.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let WalletController = class WalletController {
    constructor(walletService) {
        this.walletService = walletService;
    }
    getSupportedCurrencies() {
        return this.walletService.getSupportedCurrencies();
    }
    async getCryptoRates() {
        return this.walletService.getCryptoRates();
    }
    async getAllBalances(userId) {
        return this.walletService.getAllBalances(userId);
    }
    async getBalance(userId, currency) {
        return this.walletService.getBalance(userId, currency);
    }
    async getTransactions(userId, query) {
        return this.walletService.getTransactions(userId, query);
    }
    async getTransaction(userId, id) {
        return this.walletService.getTransaction(userId, id);
    }
    async recordDeposit(userId, dto) {
        return this.walletService.recordDeposit(userId, dto);
    }
    async requestWithdrawal(userId, dto) {
        return this.walletService.requestWithdrawal(userId, dto);
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get supported cryptocurrencies (public)", summary: 'Get supported cryptocurrencies' }),
    (0, common_1.Get)('currencies'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiResponse)({ status: 200, type: wallet_dto_1.SupportedCurrenciesResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/wallet.dto").SupportedCurrenciesResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", wallet_dto_1.SupportedCurrenciesResponseDto)
], WalletController.prototype, "getSupportedCurrencies", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get current crypto rates (public)", summary: 'Get current crypto rates' }),
    (0, common_1.Get)('rates'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiResponse)({ status: 200, type: [wallet_dto_1.CryptoRatesDto] }),
    openapi.ApiResponse({ status: 200, type: [require("./dto/wallet.dto").CryptoRatesDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getCryptoRates", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get all user balances", summary: 'Get all user balances' }),
    (0, common_1.Get)('balances'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 200, type: [wallet_dto_1.BalanceResponseDto] }),
    openapi.ApiResponse({ status: 200, type: [require("./dto/wallet.dto").BalanceResponseDto] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getAllBalances", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get balance for specific currency", summary: 'Get balance for specific currency' }),
    (0, common_1.Get)('balances/:currency'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 200, type: wallet_dto_1.BalanceResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/wallet.dto").BalanceResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getBalance", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get transaction history", summary: 'Get transaction history' }),
    (0, common_1.Get)('transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 200, type: wallet_dto_1.TransactionListResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/wallet.dto").TransactionListResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, wallet_dto_1.TransactionQueryDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTransactions", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Get single transaction", summary: 'Get single transaction' }),
    (0, common_1.Get)('transactions/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 200, type: wallet_dto_1.TransactionResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/wallet.dto").TransactionResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTransaction", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Record a deposit", summary: 'Record a deposit transaction' }),
    (0, common_1.Post)('deposit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 201, type: wallet_dto_1.TransactionResponseDto }),
    openapi.ApiResponse({ status: 201, type: require("./dto/wallet.dto").TransactionResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, wallet_dto_1.DepositDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "recordDeposit", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Request withdrawal", summary: 'Request a withdrawal' }),
    (0, common_1.Post)('withdraw'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 201, type: wallet_dto_1.TransactionResponseDto }),
    openapi.ApiResponse({ status: 201, type: require("./dto/wallet.dto").TransactionResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, wallet_dto_1.WithdrawDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "requestWithdrawal", null);
exports.WalletController = WalletController = __decorate([
    (0, swagger_1.ApiTags)('Wallet'),
    (0, common_1.Controller)('wallet'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map