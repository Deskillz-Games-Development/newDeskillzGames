import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { TournamentsService } from './tournaments.service';
import {
  CreateTournamentDto,
  TournamentQueryDto,
  JoinTournamentDto,
  SubmitScoreDto,
  TournamentResponseDto,
  TournamentListResponseDto,
  TournamentEntryResponseDto,
  LeaderboardEntryDto,
} from './dto/tournaments.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tournaments')
@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  /**
   * Get all tournaments (public)
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all tournaments with filtering' })
  @ApiResponse({ status: 200, type: TournamentListResponseDto })
  async findAll(
    @Query() query: TournamentQueryDto,
  ): Promise<TournamentListResponseDto> {
    return this.tournamentsService.findAll(query);
  }

  /**
   * Get tournament by ID (public)
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get tournament by ID' })
  @ApiResponse({ status: 200, type: TournamentResponseDto })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TournamentResponseDto> {
    return this.tournamentsService.findById(id);
  }

  /**
   * Get tournament leaderboard (public)
   */
  @Get(':id/leaderboard')
  @Public()
  @ApiOperation({ summary: 'Get tournament leaderboard' })
  @ApiResponse({ status: 200, type: [LeaderboardEntryDto] })
  async getLeaderboard(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LeaderboardEntryDto[]> {
    return this.tournamentsService.getLeaderboard(id);
  }

  /**
   * Get active tournaments for a game (public)
   */
  @Get('game/:gameId/active')
  @Public()
  @ApiOperation({ summary: 'Get active tournaments for a game' })
  @ApiResponse({ status: 200, type: [TournamentResponseDto] })
  async getActiveByGame(
    @Param('gameId', ParseUUIDPipe) gameId: string,
  ): Promise<TournamentResponseDto[]> {
    return this.tournamentsService.getActiveByGame(gameId);
  }

  /**
   * Create a new tournament (Admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new tournament' })
  @ApiResponse({ status: 201, type: TournamentResponseDto })
  async create(
    @Body() dto: CreateTournamentDto,
  ): Promise<TournamentResponseDto> {
    return this.tournamentsService.create(dto);
  }

  /**
   * Join a tournament
   */
  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Join a tournament' })
  @ApiResponse({ status: 201, type: TournamentEntryResponseDto })
  async join(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: JoinTournamentDto,
  ): Promise<TournamentEntryResponseDto> {
    return this.tournamentsService.join(id, userId, dto);
  }

  /**
   * Leave a tournament
   */
  @Delete(':id/leave')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Leave a tournament' })
  @ApiResponse({ status: 204 })
  async leave(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.tournamentsService.leave(id, userId);
  }

  /**
   * Submit score for a tournament
   */
  @Post(':id/score')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit score for a tournament' })
  @ApiResponse({ status: 200 })
  async submitScore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitScoreDto,
  ): Promise<void> {
    await this.tournamentsService.submitScore(id, userId, dto);
  }

  /**
   * Get current user's tournament entries
   */
  @Get('user/entries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user tournament entries' })
  @ApiResponse({ status: 200, type: [TournamentEntryResponseDto] })
  async getMyEntries(
    @CurrentUser('id') userId: string,
  ): Promise<TournamentEntryResponseDto[]> {
    return this.tournamentsService.getUserEntries(userId);
  }
}
