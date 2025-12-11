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
exports.LogoutDto = exports.AuthResponseDto = exports.AuthUserDto = exports.NonceResponseDto = exports.RefreshTokenDto = exports.WalletVerifyDto = exports.WalletLoginDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class WalletLoginDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { walletAddress: { required: true, type: () => String } };
    }
}
exports.WalletLoginDto = WalletLoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Wallet address',
        example: '0x1234567890123456789012345678901234567890',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WalletLoginDto.prototype, "walletAddress", void 0);
class WalletVerifyDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { message: { required: true, type: () => String }, signature: { required: true, type: () => String } };
    }
}
exports.WalletVerifyDto = WalletVerifyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'SIWE message',
        example: 'deskillz.games wants you to sign in with your Ethereum account...',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WalletVerifyDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Signature of the SIWE message',
        example: '0x...',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WalletVerifyDto.prototype, "signature", void 0);
class RefreshTokenDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { refreshToken: { required: true, type: () => String } };
    }
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Refresh token',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class NonceResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { nonce: { required: true, type: () => String } };
    }
}
exports.NonceResponseDto = NonceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nonce for SIWE message',
        example: 'a1b2c3d4e5f6',
    }),
    __metadata("design:type", String)
], NonceResponseDto.prototype, "nonce", void 0);
class AuthUserDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, username: { required: true, type: () => String }, displayName: { required: false, type: () => String }, avatarUrl: { required: false, type: () => String }, role: { required: true, type: () => String } };
    }
}
exports.AuthUserDto = AuthUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-123' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'player123' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Doe' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/avatar.jpg' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PLAYER', enum: ['PLAYER', 'DEVELOPER', 'ADMIN'] }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "role", void 0);
class AuthResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { accessToken: { required: true, type: () => String }, refreshToken: { required: true, type: () => String }, user: { required: true, type: () => require("./auth.dto").AuthUserDto } };
    }
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AuthUserDto }),
    __metadata("design:type", AuthUserDto)
], AuthResponseDto.prototype, "user", void 0);
class LogoutDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { refreshToken: { required: false, type: () => String } };
    }
}
exports.LogoutDto = LogoutDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Specific refresh token to invalidate (optional)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LogoutDto.prototype, "refreshToken", void 0);
//# sourceMappingURL=auth.dto.js.map