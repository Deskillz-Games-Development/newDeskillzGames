import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { GamesService } from './games.service';
import {
  CreateGameDto,
  UpdateGameDto,
  GameQueryDto,
  RejectGameDto,
  GameResponseDto,
  GameListResponseDto,
} from './dto/games.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  /**
   * Get all games (public)
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all games with filtering' })
  @ApiResponse({ status: 200, type: GameListResponseDto })
  async findAll(@Query() query: GameQueryDto): Promise<GameListResponseDto> {
    return this.gamesService.findAll(query);
  }

  /**
   * Get featured games (public)
   */
  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured games' })
  @ApiResponse({ status: 200, type: [GameResponseDto] })
  async getFeatured(@Query('limit') limit?: number): Promise<GameResponseDto[]> {
    return this.gamesService.getFeatured(limit);
  }

  /**
   * Get game by slug (public)
   */
  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get game by slug' })
  @ApiResponse({ status: 200, type: GameResponseDto })
  async findBySlug(@Param('slug') slug: string): Promise<GameResponseDto> {
    return this.gamesService.findBySlug(slug);
  }

  /**
   * Get game by ID (public)
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get game by ID' })
  @ApiResponse({ status: 200, type: GameResponseDto })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<GameResponseDto> {
    return this.gamesService.findById(id);
  }

  /**
   * Create new game (Developer only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER', 'ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({ status: 201, type: GameResponseDto })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateGameDto,
  ): Promise<GameResponseDto> {
    return this.gamesService.create(userId, dto);
  }

  /**
   * Update game (Developer only)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER', 'ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a game' })
  @ApiResponse({ status: 200, type: GameResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateGameDto,
  ): Promise<GameResponseDto> {
    return this.gamesService.update(id, userId, dto);
  }

  /**
   * Submit game for review (Developer only)
   */
  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER', 'ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit game for review' })
  @ApiResponse({ status: 200, type: GameResponseDto })
  async submitForReview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<GameResponseDto> {
    return this.gamesService.submitForReview(id, userId);
  }

  /**
   * Approve game (Admin only)
   */
  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Approve a game' })
  @ApiResponse({ status: 200, type: GameResponseDto })
  async approve(@Param('id', ParseUUIDPipe) id: string): Promise<GameResponseDto> {
    return this.gamesService.approve(id);
  }

  /**
   * Reject game (Admin only)
   */
  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reject a game' })
  @ApiResponse({ status: 200, type: GameResponseDto })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectGameDto,
  ): Promise<GameResponseDto> {
    return this.gamesService.reject(id, dto.reason);
  }
}
