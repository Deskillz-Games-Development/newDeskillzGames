import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
  IsDateString,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// ==========================================
// ENUMS
// ==========================================

export enum TournamentMode {
  SYNC = 'SYNC',
  ASYNC = 'ASYNC',
}

export enum TournamentStatus {
  SCHEDULED = 'SCHEDULED',
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CryptoCurrency {
  ETH = 'ETH',
  BTC = 'BTC',
  BNB = 'BNB',
  SOL = 'SOL',
  XRP = 'XRP',
  USDT_ETH = 'USDT_ETH',
  USDT_TRON = 'USDT_TRON',
  USDT_BSC = 'USDT_BSC',
  USDC_ETH = 'USDC_ETH',
  USDC_POLYGON = 'USDC_POLYGON',
  USDC_ARB = 'USDC_ARB',
  USDC_BASE = 'USDC_BASE',
}

export enum EntryStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PLAYING = 'PLAYING',
  COMPLETED = 'COMPLETED',
  FORFEITED = 'FORFEITED',
  REFUNDED = 'REFUNDED',
}

// ==========================================
// REQUEST DTOs
// ==========================================

export class CreateTournamentDto {
  @ApiProperty()
  @IsString()
  gameId: string;

  @ApiProperty({ example: 'Weekend Championship' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TournamentMode })
  @IsEnum(TournamentMode)
  mode: TournamentMode;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  entryFee: number;

  @ApiProperty({ enum: CryptoCurrency })
  @IsEnum(CryptoCurrency)
  entryCurrency: CryptoCurrency;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  prizePool: number;

  @ApiProperty({ enum: CryptoCurrency })
  @IsEnum(CryptoCurrency)
  prizeCurrency: CryptoCurrency;

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @Min(2)
  @IsOptional()
  minPlayers?: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(2)
  @Max(10000)
  maxPlayers: number;

  @ApiProperty({
    example: { '1': 50, '2': 30, '3': 20 },
    description: 'Prize distribution by rank (percentages)',
  })
  @IsObject()
  prizeDistribution: Record<string, number>;

  @ApiProperty({ example: '2024-12-15T18:00:00Z' })
  @IsDateString()
  scheduledStart: string;

  @ApiPropertyOptional({ example: '2024-12-15T22:00:00Z' })
  @IsDateString()
  @IsOptional()
  scheduledEnd?: string;

  @ApiPropertyOptional({ example: 300, description: 'Match duration in seconds' })
  @IsInt()
  @IsOptional()
  matchDuration?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  roundsCount?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Min(0)
  @Max(50)
  @IsOptional()
  platformFeePercent?: number;
}

export class TournamentQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ enum: TournamentStatus })
  @IsEnum(TournamentStatus)
  @IsOptional()
  status?: TournamentStatus;

  @ApiPropertyOptional({ enum: TournamentMode })
  @IsEnum(TournamentMode)
  @IsOptional()
  mode?: TournamentMode;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  gameId?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  minEntryFee?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxEntryFee?: number;

  @ApiPropertyOptional({ enum: CryptoCurrency })
  @IsEnum(CryptoCurrency)
  @IsOptional()
  currency?: CryptoCurrency;

  @ApiPropertyOptional({ default: 'scheduledStart' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ default: 'asc' })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class JoinTournamentDto {
  @ApiPropertyOptional({ description: 'Transaction hash for entry payment' })
  @IsString()
  @IsOptional()
  txHash?: string;
}

export class SubmitScoreDto {
  @ApiProperty({ example: 15000 })
  @IsInt()
  @Min(0)
  score: number;

  @ApiPropertyOptional({ description: 'Game-specific metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'SDK-signed score signature' })
  @IsString()
  @IsOptional()
  signature?: string;
}

// ==========================================
// RESPONSE DTOs
// ==========================================

export class GameInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  iconUrl?: string;
}

export class UserInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  displayName?: string;

  @ApiPropertyOptional()
  avatarUrl?: string;
}

export class TournamentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  gameId: string;

  @ApiProperty({ type: GameInfoDto })
  game: GameInfoDto;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: TournamentMode })
  mode: string;

  @ApiProperty()
  entryFee: string;

  @ApiProperty({ enum: CryptoCurrency })
  entryCurrency: string;

  @ApiProperty()
  prizePool: string;

  @ApiProperty({ enum: CryptoCurrency })
  prizeCurrency: string;

  @ApiProperty()
  minPlayers: number;

  @ApiProperty()
  maxPlayers: number;

  @ApiProperty()
  currentPlayers: number;

  @ApiProperty()
  prizeDistribution: Record<string, number>;

  @ApiProperty()
  scheduledStart: Date;

  @ApiPropertyOptional()
  scheduledEnd?: Date;

  @ApiPropertyOptional()
  actualStart?: Date;

  @ApiPropertyOptional()
  actualEnd?: Date;

  @ApiPropertyOptional()
  matchDuration?: number;

  @ApiProperty()
  roundsCount: number;

  @ApiProperty({ enum: TournamentStatus })
  status: string;

  @ApiProperty()
  platformFeePercent: number;

  @ApiProperty()
  entriesCount: number;

  @ApiProperty()
  createdAt: Date;
}

export class TournamentEntryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tournamentId: string;

  @ApiPropertyOptional({ type: TournamentResponseDto })
  tournament?: TournamentResponseDto;

  @ApiProperty()
  userId: string;

  @ApiProperty({ type: UserInfoDto })
  user: UserInfoDto;

  @ApiProperty()
  entryAmount: string;

  @ApiProperty({ enum: CryptoCurrency })
  entryCurrency: string;

  @ApiPropertyOptional()
  entryTxHash?: string;

  @ApiProperty({ enum: EntryStatus })
  status: string;

  @ApiPropertyOptional()
  finalRank?: number;

  @ApiPropertyOptional()
  prizeWon?: string;

  @ApiPropertyOptional()
  prizeTxHash?: string;

  @ApiProperty()
  joinedAt: Date;

  @ApiPropertyOptional()
  startedAt?: Date;

  @ApiPropertyOptional()
  completedAt?: Date;
}

export class LeaderboardEntryDto {
  @ApiProperty()
  rank: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  displayName?: string;

  @ApiPropertyOptional()
  avatarUrl?: string;

  @ApiProperty()
  score: number;

  @ApiProperty()
  submittedAt: Date;
}

export class PaginationDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}

export class TournamentListResponseDto {
  @ApiProperty({ type: [TournamentResponseDto] })
  tournaments: TournamentResponseDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
