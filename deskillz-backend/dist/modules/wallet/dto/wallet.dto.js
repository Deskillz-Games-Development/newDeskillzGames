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
exports.SupportedCurrenciesResponseDto = exports.SupportedCurrencyDto = exports.TransactionListResponseDto = exports.PaginationDto = exports.CryptoRatesDto = exports.BalanceResponseDto = exports.TransactionResponseDto = exports.WithdrawDto = exports.DepositDto = exports.TransactionQueryDto = exports.CryptoCurrency = exports.TransactionStatus = exports.TransactionType = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "DEPOSIT";
    TransactionType["WITHDRAWAL"] = "WITHDRAWAL";
    TransactionType["ENTRY_FEE"] = "ENTRY_FEE";
    TransactionType["PRIZE_WIN"] = "PRIZE_WIN";
    TransactionType["REFUND"] = "REFUND";
    TransactionType["DEVELOPER_PAYOUT"] = "DEVELOPER_PAYOUT";
    TransactionType["PLATFORM_FEE"] = "PLATFORM_FEE";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["PROCESSING"] = "PROCESSING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["CANCELLED"] = "CANCELLED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
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
class TransactionQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { page: { required: false, type: () => Number, minimum: 1 }, limit: { required: false, type: () => Number, minimum: 1, maximum: 100 }, type: { required: false, enum: require("./wallet.dto").TransactionType }, status: { required: false, enum: require("./wallet.dto").TransactionStatus }, currency: { required: false, enum: require("./wallet.dto").CryptoCurrency }, sortBy: { required: false, type: () => String }, sortOrder: { required: false, type: () => Object } };
    }
}
exports.TransactionQueryDto = TransactionQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], TransactionQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], TransactionQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: TransactionType }),
    (0, class_validator_1.IsEnum)(TransactionType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TransactionQueryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: TransactionStatus }),
    (0, class_validator_1.IsEnum)(TransactionStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TransactionQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: CryptoCurrency }),
    (0, class_validator_1.IsEnum)(CryptoCurrency),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TransactionQueryDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'createdAt' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TransactionQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'desc' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TransactionQueryDto.prototype, "sortOrder", void 0);
class DepositDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { txHash: { required: true, type: () => String }, amount: { required: true, type: () => Number, minimum: 0 }, currency: { required: true, enum: require("./wallet.dto").CryptoCurrency }, fromAddress: { required: true, type: () => String }, toAddress: { required: true, type: () => String }, chain: { required: true, type: () => String } };
    }
}
exports.DepositDto = DepositDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0x123...' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DepositDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DepositDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CryptoCurrency }),
    (0, class_validator_1.IsEnum)(CryptoCurrency),
    __metadata("design:type", String)
], DepositDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0xabc...' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DepositDto.prototype, "fromAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0xdef...' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DepositDto.prototype, "toAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ethereum' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DepositDto.prototype, "chain", void 0);
class WithdrawDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { amount: { required: true, type: () => Number, minimum: 0.001 }, currency: { required: true, enum: require("./wallet.dto").CryptoCurrency }, toAddress: { required: true, type: () => String }, chain: { required: true, type: () => String } };
    }
}
exports.WithdrawDto = WithdrawDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], WithdrawDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CryptoCurrency }),
    (0, class_validator_1.IsEnum)(CryptoCurrency),
    __metadata("design:type", String)
], WithdrawDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0xabc...' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawDto.prototype, "toAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ethereum' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawDto.prototype, "chain", void 0);
class TransactionResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, type: { required: true, type: () => String }, amount: { required: true, type: () => String }, currency: { required: true, type: () => String }, txHash: { required: false, type: () => String }, fromAddress: { required: false, type: () => String }, toAddress: { required: false, type: () => String }, chain: { required: false, type: () => String }, status: { required: true, type: () => String }, failureReason: { required: false, type: () => String }, description: { required: false, type: () => String }, createdAt: { required: true, type: () => Date }, completedAt: { required: false, type: () => Date } };
    }
}
exports.TransactionResponseDto = TransactionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: TransactionType }),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CryptoCurrency }),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "fromAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "toAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "chain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: TransactionStatus }),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "failureReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], TransactionResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], TransactionResponseDto.prototype, "completedAt", void 0);
class BalanceResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { currency: { required: true, type: () => String }, total: { required: true, type: () => String }, available: { required: true, type: () => String }, pending: { required: true, type: () => String } };
    }
}
exports.BalanceResponseDto = BalanceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BalanceResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BalanceResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BalanceResponseDto.prototype, "available", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BalanceResponseDto.prototype, "pending", void 0);
class CryptoRatesDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { currency: { required: true, type: () => String }, usdPrice: { required: true, type: () => Number }, change24h: { required: true, type: () => Number } };
    }
}
exports.CryptoRatesDto = CryptoRatesDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CryptoRatesDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CryptoRatesDto.prototype, "usdPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CryptoRatesDto.prototype, "change24h", void 0);
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
class TransactionListResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { transactions: { required: true, type: () => [require("./wallet.dto").TransactionResponseDto] }, pagination: { required: true, type: () => require("./wallet.dto").PaginationDto } };
    }
}
exports.TransactionListResponseDto = TransactionListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [TransactionResponseDto] }),
    __metadata("design:type", Array)
], TransactionListResponseDto.prototype, "transactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PaginationDto }),
    __metadata("design:type", PaginationDto)
], TransactionListResponseDto.prototype, "pagination", void 0);
class SupportedCurrencyDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { symbol: { required: true, type: () => String }, name: { required: true, type: () => String }, chains: { required: true, type: () => [String] } };
    }
}
exports.SupportedCurrencyDto = SupportedCurrencyDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SupportedCurrencyDto.prototype, "symbol", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SupportedCurrencyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], SupportedCurrencyDto.prototype, "chains", void 0);
class SupportedCurrenciesResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { currencies: { required: true, type: () => [require("./wallet.dto").SupportedCurrencyDto] } };
    }
}
exports.SupportedCurrenciesResponseDto = SupportedCurrenciesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SupportedCurrencyDto] }),
    __metadata("design:type", Array)
], SupportedCurrenciesResponseDto.prototype, "currencies", void 0);
//# sourceMappingURL=wallet.dto.js.map