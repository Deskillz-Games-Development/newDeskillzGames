import { AuthService } from './auth.service';
import { WalletVerifyDto, RefreshTokenDto, AuthResponseDto, NonceResponseDto, LogoutDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getNonce(walletAddress: string): Promise<NonceResponseDto>;
    verifyWallet(dto: WalletVerifyDto): Promise<AuthResponseDto>;
    refresh(dto: RefreshTokenDto): Promise<AuthResponseDto>;
    logout(userId: string, dto: LogoutDto): Promise<void>;
    getMe(user: any): Promise<any>;
}
