import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

// ==========================================
// ENUMS
// ==========================================

export enum LeaderboardPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'all_time',
}

// ==========================================
// REQUEST DTOs
// ==========================================

export class LeaderboardQueryDto {
  @ApiPropertyOptional({ enum: LeaderboardPeriod, default: 'all_time' })
  @IsEnum(LeaderboardPeriod)
  @IsOptional()
  period?: string;

  @ApiPropertyOptional({ default: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;
}

// ==========================================
// RESPONSE DTOs
// ==========================================

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

  @ApiPropertyOptional()
  wins?: number;

  @ApiPropertyOptional()
  matches?: number;

  @ApiPropertyOptional()
  earnings?: string;

  @ApiPropertyOptional()
  totalScore?: number;

  @ApiPropertyOptional()
  skillRating?: number;

  @ApiPropertyOptional()
  winRate?: number;
}

export class LeaderboardResponseDto {
  @ApiProperty()
  period: string;

  @ApiPropertyOptional()
  gameId?: string;

  @ApiProperty({ type: [LeaderboardEntryDto] })
  entries: LeaderboardEntryDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  lastUpdated: Date;
}

export class UserRankDto {
  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  gameId?: string;

  @ApiPropertyOptional()
  globalRank?: number;

  @ApiPropertyOptional()
  gameRank?: number;

  @ApiPropertyOptional()
  earnings?: string;

  @ApiPropertyOptional()
  wins?: number;

  @ApiPropertyOptional()
  totalScore?: number;

  @ApiPropertyOptional()
  message?: string;
}

export class GameStatsDto {
  @ApiProperty()
  gameId: string;

  @ApiProperty()
  gameName: string;

  @ApiProperty()
  totalMatches: number;

  @ApiProperty()
  totalPlayers: number;

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  totalRatings: number;

  @ApiProperty()
  completedTournaments: number;

  @ApiProperty()
  totalPrizePool: string;

  @ApiProperty()
  activeTournaments: number;
}

export class PlatformStatsDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  activeUsers: number;

  @ApiProperty()
  totalGames: number;

  @ApiProperty()
  totalTournaments: number;

  @ApiProperty()
  completedTournaments: number;

  @ApiProperty()
  activeTournaments: number;

  @ApiProperty()
  totalPrizeDistributed: string;

  @ApiProperty()
  lastUpdated: Date;
}
