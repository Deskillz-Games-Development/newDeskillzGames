import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';

// ==========================================
// ENUMS
// ==========================================

export enum SdkEnvironment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

// ==========================================
// REQUEST DTOs
// ==========================================

export class CreateSdkKeyDto {
  @ApiProperty()
  @IsString()
  gameId: string;

  @ApiProperty({ example: 'Production Key' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: SdkEnvironment })
  @IsEnum(SdkEnvironment)
  @IsOptional()
  environment?: SdkEnvironment;
}

export class PayoutRequestDto {
  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(10) // Minimum payout amount
  amount: number;

  @ApiProperty({ example: 'USDT_TRON' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 'TAddress...' })
  @IsString()
  walletAddress: string;

  @ApiProperty({ example: 'tron' })
  @IsString()
  chain: string;
}

export class UpdateDeveloperSettingsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  supportEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  defaultPayoutWallet?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  defaultPayoutChain?: string;
}

// ==========================================
// RESPONSE DTOs
// ==========================================

export class GameSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  totalMatches: number;

  @ApiProperty()
  totalPlayers: number;

  @ApiProperty()
  revenue: string;

  @ApiProperty()
  tournamentsCount: number;
}

export class RecentActivityDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  gameName: string;

  @ApiProperty()
  tournamentName: string;

  @ApiProperty()
  players: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;
}

export class DeveloperDashboardDto {
  @ApiProperty()
  totalGames: number;

  @ApiProperty()
  approvedGames: number;

  @ApiProperty()
  pendingGames: number;

  @ApiProperty()
  totalMatches: number;

  @ApiProperty()
  totalPlayers: number;

  @ApiProperty()
  totalRevenue: string;

  @ApiProperty()
  pendingPayouts: string;

  @ApiProperty()
  activeTournaments: number;

  @ApiProperty({ type: [GameSummaryDto] })
  games: GameSummaryDto[];

  @ApiProperty({ type: [RecentActivityDto] })
  recentActivity: RecentActivityDto[];
}

export class GameAnalyticsDto {
  @ApiProperty()
  gameId: string;

  @ApiProperty()
  gameName: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  totalMatches: number;

  @ApiProperty()
  totalPlayers: number;

  @ApiProperty()
  totalRevenue: string;

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  tournamentsByStatus: Record<string, number>;

  @ApiProperty()
  playersLast7Days: number;

  @ApiProperty()
  playersLast30Days: number;

  @ApiProperty()
  retentionRate: number;

  @ApiProperty()
  averageScore: number;

  @ApiProperty()
  highestScore: number;

  @ApiProperty()
  lowestScore: number;
}

export class GameRevenueDto {
  @ApiProperty()
  gameId: string;

  @ApiProperty()
  gameName: string;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  tournamentsCompleted: number;
}

export class PayoutHistoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  txHash?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  completedAt?: Date;
}

export class RevenueReportDto {
  @ApiProperty()
  developerId: string;

  @ApiProperty()
  period: { start: Date | null; end: Date | null };

  @ApiProperty()
  totalRevenue: string;

  @ApiProperty({ type: [GameRevenueDto] })
  revenueByGame: GameRevenueDto[];

  @ApiProperty()
  totalTournamentsCompleted: number;

  @ApiProperty({ type: [PayoutHistoryDto] })
  recentPayouts: PayoutHistoryDto[];
}

export class SdkKeyDto {
  @ApiProperty()
  apiKey: string;

  @ApiPropertyOptional()
  apiSecret?: string;

  @ApiProperty()
  gameId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  environment: string;

  @ApiProperty()
  createdAt: Date;
}

export class PayoutResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  walletAddress: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  estimatedArrival: Date;

  @ApiProperty()
  createdAt: Date;
}

export class DeveloperSettingsDto {
  @ApiPropertyOptional()
  companyName?: string;

  @ApiPropertyOptional()
  website?: string;

  @ApiPropertyOptional()
  supportEmail?: string;

  @ApiPropertyOptional()
  defaultPayoutWallet?: string;

  @ApiPropertyOptional()
  defaultPayoutChain?: string;
}
