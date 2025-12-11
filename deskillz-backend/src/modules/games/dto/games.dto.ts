import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

// ==========================================
// ENUMS
// ==========================================

export enum GamePlatform {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  BOTH = 'BOTH',
}

export enum GameStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

// ==========================================
// REQUEST DTOs
// ==========================================

export class CreateGameDto {
  @ApiProperty({ example: 'Puzzle Master' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'A challenging puzzle game...' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Match colors and solve puzzles!' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'https://example.com/icon.png' })
  @IsUrl()
  @IsOptional()
  iconUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/banner.jpg' })
  @IsUrl()
  @IsOptional()
  bannerUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  screenshots?: string[];

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=xxx' })
  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ type: [String], example: ['puzzle', 'casual'] })
  @IsArray()
  @IsOptional()
  genre?: string[];

  @ApiPropertyOptional({ type: [String], example: ['strategy', 'brain'] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ enum: GamePlatform })
  @IsEnum(GamePlatform)
  platform: GamePlatform;

  @ApiPropertyOptional({ example: 'https://play.google.com/store/apps/details?id=xxx' })
  @IsUrl()
  @IsOptional()
  androidUrl?: string;

  @ApiPropertyOptional({ example: 'https://apps.apple.com/app/xxx' })
  @IsUrl()
  @IsOptional()
  iosUrl?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  minPlayers?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  maxPlayers?: number;

  @ApiPropertyOptional({ example: 300, description: 'Average match duration in seconds' })
  @IsInt()
  @IsOptional()
  avgMatchDuration?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  supportsSync?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  supportsAsync?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  demoEnabled?: boolean;
}

export class UpdateGameDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  iconUrl?: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  bannerUrl?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  screenshots?: string[];

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  genre?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  androidUrl?: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  iosUrl?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  minPlayers?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  maxPlayers?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  avgMatchDuration?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  supportsSync?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  supportsAsync?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  demoEnabled?: boolean;
}

export class GameQueryDto {
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

  @ApiPropertyOptional({ enum: GameStatus })
  @IsEnum(GameStatus)
  @IsOptional()
  status?: GameStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  genre?: string;

  @ApiPropertyOptional({ enum: GamePlatform })
  @IsEnum(GamePlatform)
  @IsOptional()
  platform?: GamePlatform;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  developerId?: string;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ default: 'desc' })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class RejectGameDto {
  @ApiProperty({ example: 'Game violates content guidelines' })
  @IsString()
  reason: string;
}

// ==========================================
// RESPONSE DTOs
// ==========================================

export class DeveloperInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  displayName?: string;
}

export class GameResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  developerId: string;

  @ApiProperty({ type: DeveloperInfoDto })
  developer: DeveloperInfoDto;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  shortDescription?: string;

  @ApiPropertyOptional()
  iconUrl?: string;

  @ApiPropertyOptional()
  bannerUrl?: string;

  @ApiProperty({ type: [String] })
  screenshots: string[];

  @ApiPropertyOptional()
  videoUrl?: string;

  @ApiProperty({ type: [String] })
  genre: string[];

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({ enum: GamePlatform })
  platform: string;

  @ApiPropertyOptional()
  androidUrl?: string;

  @ApiPropertyOptional()
  iosUrl?: string;

  @ApiProperty()
  minPlayers: number;

  @ApiProperty()
  maxPlayers: number;

  @ApiPropertyOptional()
  avgMatchDuration?: number;

  @ApiProperty()
  supportsSync: boolean;

  @ApiProperty()
  supportsAsync: boolean;

  @ApiProperty()
  demoEnabled: boolean;

  @ApiProperty({ enum: GameStatus })
  status: string;

  @ApiProperty()
  totalMatches: number;

  @ApiProperty()
  totalPlayers: number;

  @ApiProperty()
  avgRating: number;

  @ApiProperty()
  ratingCount: number;

  @ApiProperty()
  tournamentsCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  approvedAt?: Date;

  @ApiPropertyOptional()
  launchedAt?: Date;
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

export class GameListResponseDto {
  @ApiProperty({ type: [GameResponseDto] })
  games: GameResponseDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
