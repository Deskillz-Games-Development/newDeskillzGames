import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEthereumAddress,
  IsOptional,
} from 'class-validator';

// ==========================================
// REQUEST DTOs
// ==========================================

export class WalletLoginDto {
  @ApiProperty({
    description: 'Wallet address',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}

export class WalletVerifyDto {
  @ApiProperty({
    description: 'SIWE message',
    example:
      'deskillz.games wants you to sign in with your Ethereum account...',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Signature of the SIWE message',
    example: '0x...',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

// ==========================================
// RESPONSE DTOs
// ==========================================

export class NonceResponseDto {
  @ApiProperty({
    description: 'Nonce for SIWE message',
    example: 'a1b2c3d4e5f6',
  })
  nonce: string;
}

export class AuthUserDto {
  @ApiProperty({ example: 'uuid-123' })
  id: string;

  @ApiProperty({ example: 'player123' })
  username: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  displayName?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string;

  @ApiProperty({ example: 'PLAYER', enum: ['PLAYER', 'DEVELOPER', 'ADMIN'] })
  role: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}

export class LogoutDto {
  @ApiPropertyOptional({
    description: 'Specific refresh token to invalidate (optional)',
  })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}

// ==========================================
// JWT PAYLOAD
// ==========================================

export interface JwtPayload {
  sub: string; // User ID
  iat?: number; // Issued at
  exp?: number; // Expiration
}
