import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { LeaderboardService } from './leaderboard.service';
import {
  LeaderboardQueryDto,
  LeaderboardResponseDto,
  UserRankDto,
  GameStatsDto,
  PlatformStatsDto,
} from './dto/leaderboard.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('global')
  @Public()
  @ApiOperation({ summary: 'Get global leaderboard' })
  @ApiResponse({ status: 200, type: LeaderboardResponseDto })
  async getGlobalLeaderboard(
    @Query() query: LeaderboardQueryDto,
  ): Promise<LeaderboardResponseDto> {
    return this.leaderboardService.getGlobalLeaderboard(query);
  }

  @Get('game/:gameId')
  @Public()
  @ApiOperation({ summary: 'Get game-specific leaderboard' })
  @ApiResponse({ status: 200, type: LeaderboardResponseDto })
  async getGameLeaderboard(
    @Param('gameId') gameId: string,
    @Query() query: LeaderboardQueryDto,
  ): Promise<LeaderboardResponseDto> {
    return this.leaderboardService.getGameLeaderboard(gameId, query);
  }

  @Get('game/:gameId/stats')
  @Public()
  @ApiOperation({ summary: 'Get game statistics' })
  @ApiResponse({ status: 200, type: GameStatsDto })
  async getGameStats(@Param('gameId') gameId: string): Promise<GameStatsDto> {
    const stats = await this.leaderboardService.getGameStats(gameId);
    if (!stats) {
      throw new NotFoundException('Game not found');
    }
    return stats;
  }

  @Get('platform/stats')
  @Public()
  @ApiOperation({ summary: 'Get platform-wide statistics' })
  @ApiResponse({ status: 200, type: PlatformStatsDto })
  async getPlatformStats(): Promise<PlatformStatsDto> {
    return this.leaderboardService.getPlatformStats();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user global rank' })
  @ApiResponse({ status: 200, type: UserRankDto })
  async getMyRank(@CurrentUser('id') userId: string): Promise<UserRankDto> {
    return this.leaderboardService.getUserRank(userId);
  }

  @Get('me/game/:gameId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user rank for a game' })
  @ApiResponse({ status: 200, type: UserRankDto })
  async getMyGameRank(
    @CurrentUser('id') userId: string,
    @Param('gameId') gameId: string,
  ): Promise<UserRankDto> {
    return this.leaderboardService.getUserRank(userId, gameId);
  }

  @Get('user/:userId')
  @Public()
  @ApiOperation({ summary: 'Get user rank' })
  @ApiResponse({ status: 200, type: UserRankDto })
  async getUserRank(@Param('userId') userId: string): Promise<UserRankDto> {
    return this.leaderboardService.getUserRank(userId);
  }
}