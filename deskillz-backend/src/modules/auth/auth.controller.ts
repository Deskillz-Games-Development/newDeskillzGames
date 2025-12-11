import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import {
  WalletLoginDto,
  WalletVerifyDto,
  RefreshTokenDto,
  AuthResponseDto,
  NonceResponseDto,
  LogoutDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Get nonce for wallet authentication (SIWE)
   */
  @Get('nonce')
  @Public()
  @ApiOperation({ summary: 'Get nonce for wallet signature' })
  @ApiResponse({
    status: 200,
    description: 'Nonce generated successfully',
    type: NonceResponseDto,
  })
  async getNonce(
    @Query('walletAddress') walletAddress: string,
  ): Promise<NonceResponseDto> {
    return this.authService.generateNonce(walletAddress);
  }

  /**
   * Verify wallet signature and login
   */
  @Post('wallet/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify wallet signature and authenticate' })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  async verifyWallet(@Body() dto: WalletVerifyDto): Promise<AuthResponseDto> {
    return this.authService.verifyWalletSignature(dto);
  }

  /**
   * Refresh access token
   */
  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(dto);
  }

  /**
   * Logout - invalidate session
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout and invalidate session' })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  async logout(
    @CurrentUser('id') userId: string,
    @Body() dto: LogoutDto,
  ): Promise<void> {
    await this.authService.logout(userId, dto.refreshToken);
  }

  /**
   * Get current user info
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'User info returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: any) {
    return user;
  }
}
