import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

// ==========================================
// REQUEST DTOs
// ==========================================

export class CreateUserDto {
  @ApiProperty({ example: 'player123' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  displayName?: string;
}

export class CreateUserWithWalletDto {
  @ApiProperty({ example: '0x1234567890123456789012345678901234567890' })
  @IsString()
  walletAddress: string;

  @ApiPropertyOptional({ example: 'ethereum' })
  @IsString()
  @IsOptional()
  chain?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'player123' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  displayName?: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;
}

export class AddWalletDto {
  @ApiProperty({ example: '0x1234567890123456789012345678901234567890' })
  @IsString()
  walletAddress: string;

  @ApiProperty({ example: 'ethereum' })
  @IsString()
  chain: string;

  @ApiProperty({ example: 'metamask' })
  @IsString()
  walletType: string;

  @ApiPropertyOptional({ example: 'My Trading Wallet' })
  @IsString()
  @IsOptional()
  label?: string;
}

// ==========================================
// RESPONSE DTOs
// ==========================================

export class WalletResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  walletAddress: string;

  @ApiProperty()
  chain: string;

  @ApiProperty()
  walletType: string;

  @ApiProperty()
  isPrimary: boolean;

  @ApiPropertyOptional()
  label?: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  displayName?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  avatarUrl?: string;

  @ApiProperty({ enum: ['PLAYER', 'DEVELOPER', 'ADMIN'] })
  role: string;

  @ApiProperty({ enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] })
  status: string;

  @ApiProperty()
  skillRating: number;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({ type: [WalletResponseDto] })
  wallets?: WalletResponseDto[];
}

export class UserStatsDto {
  @ApiProperty()
  totalWins: number;

  @ApiProperty()
  totalMatches: number;

  @ApiProperty()
  totalEarnings: string;

  @ApiProperty()
  skillRating: number;

  @ApiProperty()
  winRate: number;

  @ApiProperty()
  tournamentsPlayed: number;
}
