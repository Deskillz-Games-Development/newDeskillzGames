export declare class WalletLoginDto {
    walletAddress: string;
}
export declare class WalletVerifyDto {
    message: string;
    signature: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class NonceResponseDto {
    nonce: string;
}
export declare class AuthUserDto {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    role: string;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: AuthUserDto;
}
export declare class LogoutDto {
    refreshToken?: string;
}
export interface JwtPayload {
    sub: string;
    iat?: number;
    exp?: number;
}
