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
exports.UserStatsDto = exports.UserResponseDto = exports.WalletResponseDto = exports.AddWalletDto = exports.UpdateUserDto = exports.CreateUserWithWalletDto = exports.CreateUserDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateUserDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { username: { required: true, type: () => String, minLength: 3, maxLength: 30, pattern: "/^[a-zA-Z0-9_]+$/" }, email: { required: false, type: () => String }, displayName: { required: false, type: () => String, maxLength: 50 } };
    }
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'player123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(30),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'john@example.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateUserDto.prototype, "displayName", void 0);
class CreateUserWithWalletDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { walletAddress: { required: true, type: () => String }, chain: { required: false, type: () => String } };
    }
}
exports.CreateUserWithWalletDto = CreateUserWithWalletDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0x1234567890123456789012345678901234567890' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserWithWalletDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ethereum' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUserWithWalletDto.prototype, "chain", void 0);
class UpdateUserDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { username: { required: false, type: () => String, minLength: 3, maxLength: 30, pattern: "/^[a-zA-Z0-9_]+$/" }, displayName: { required: false, type: () => String, maxLength: 50 }, email: { required: false, type: () => String }, avatarUrl: { required: false, type: () => String }, notificationsEnabled: { required: false, type: () => Boolean }, emailNotifications: { required: false, type: () => Boolean } };
    }
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'player123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(30),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores',
    }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'john@example.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/avatar.jpg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "notificationsEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "emailNotifications", void 0);
class AddWalletDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { walletAddress: { required: true, type: () => String }, chain: { required: true, type: () => String }, walletType: { required: true, type: () => String }, label: { required: false, type: () => String } };
    }
}
exports.AddWalletDto = AddWalletDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0x1234567890123456789012345678901234567890' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddWalletDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ethereum' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddWalletDto.prototype, "chain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'metamask' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddWalletDto.prototype, "walletType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'My Trading Wallet' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddWalletDto.prototype, "label", void 0);
class WalletResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, walletAddress: { required: true, type: () => String }, chain: { required: true, type: () => String }, walletType: { required: true, type: () => String }, isPrimary: { required: true, type: () => Boolean }, label: { required: false, type: () => String } };
    }
}
exports.WalletResponseDto = WalletResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], WalletResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], WalletResponseDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], WalletResponseDto.prototype, "chain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], WalletResponseDto.prototype, "walletType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], WalletResponseDto.prototype, "isPrimary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], WalletResponseDto.prototype, "label", void 0);
class UserResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, username: { required: true, type: () => String }, displayName: { required: false, type: () => String }, email: { required: false, type: () => String }, avatarUrl: { required: false, type: () => String }, role: { required: true, type: () => String }, status: { required: true, type: () => String }, skillRating: { required: true, type: () => Number }, createdAt: { required: true, type: () => Date }, wallets: { required: false, type: () => [require("./users.dto").WalletResponseDto] } };
    }
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['PLAYER', 'DEVELOPER', 'ADMIN'] }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UserResponseDto.prototype, "skillRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [WalletResponseDto] }),
    __metadata("design:type", Array)
], UserResponseDto.prototype, "wallets", void 0);
class UserStatsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { totalWins: { required: true, type: () => Number }, totalMatches: { required: true, type: () => Number }, totalEarnings: { required: true, type: () => String }, skillRating: { required: true, type: () => Number }, winRate: { required: true, type: () => Number }, tournamentsPlayed: { required: true, type: () => Number } };
    }
}
exports.UserStatsDto = UserStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UserStatsDto.prototype, "totalWins", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UserStatsDto.prototype, "totalMatches", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserStatsDto.prototype, "totalEarnings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UserStatsDto.prototype, "skillRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UserStatsDto.prototype, "winRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UserStatsDto.prototype, "tournamentsPlayed", void 0);
//# sourceMappingURL=users.dto.js.map