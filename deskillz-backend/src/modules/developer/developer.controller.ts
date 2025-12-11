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

import { DeveloperService } from './developer.service';
import {
  DeveloperDashboardDto,
  GameAnalyticsDto,
  RevenueReportDto,
  SdkKeyDto,
  CreateSdkKeyDto,
  PayoutRequestDto,
  PayoutResponseDto,
} from './dto/developer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Developer')
@Controller('developer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DEVELOPER', 'ADMIN')
@ApiBearerAuth('JWT-auth')
export class DeveloperController {
  constructor(private readonly developerService: DeveloperService) {}

  /**
   * Get developer dashboard
   */
  @Get('dashboard')
  @ApiOperation({ summary: 'Get developer dashboard overview' })
  @ApiResponse({ status: 200, type: DeveloperDashboardDto })
  async getDashboard(
    @CurrentUser('id') userId: string,
  ): Promise<DeveloperDashboardDto> {
    return this.developerService.getDashboard(userId);
  }

  /**
   * Get game analytics
   */
  @Get('games/:gameId/analytics')
  @ApiOperation({ summary: 'Get detailed game analytics' })
  @ApiResponse({ status: 200, type: GameAnalyticsDto })
  async getGameAnalytics(
    @CurrentUser('id') userId: string,
    @Param('gameId', ParseUUIDPipe) gameId: string,
  ): Promise<GameAnalyticsDto> {
    return this.developerService.getGameAnalytics(userId, gameId);
  }

  /**
   * Get revenue report
   */
  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue report' })
  @ApiResponse({ status: 200, type: RevenueReportDto })
  async getRevenueReport(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<RevenueReportDto> {
    return this.developerService.getRevenueReport(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Generate SDK API key
   */
  @Post('sdk-keys')
  @ApiOperation({ summary: 'Generate SDK API key' })
  @ApiResponse({ status: 201, type: SdkKeyDto })
  async generateSdkKey(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSdkKeyDto,
  ): Promise<SdkKeyDto> {
    return this.developerService.generateSdkKey(userId, dto);
  }

  /**
   * List SDK keys
   */
  @Get('sdk-keys')
  @ApiOperation({ summary: 'List SDK API keys' })
  @ApiResponse({ status: 200, type: [SdkKeyDto] })
  async listSdkKeys(
    @CurrentUser('id') userId: string,
  ): Promise<Omit<SdkKeyDto, 'apiSecret'>[]> {
    return this.developerService.listSdkKeys(userId);
  }

  /**
   * Revoke SDK key
   */
  @Delete('sdk-keys/:apiKey')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke SDK API key' })
  @ApiResponse({ status: 204 })
  async revokeSdkKey(
    @CurrentUser('id') userId: string,
    @Param('apiKey') apiKey: string,
  ): Promise<void> {
    await this.developerService.revokeSdkKey(userId, apiKey);
  }

  /**
   * Request payout
   */
  @Post('payouts')
  @ApiOperation({ summary: 'Request developer payout' })
  @ApiResponse({ status: 201, type: PayoutResponseDto })
  async requestPayout(
    @CurrentUser('id') userId: string,
    @Body() dto: PayoutRequestDto,
  ): Promise<PayoutResponseDto> {
    return this.developerService.requestPayout(userId, dto);
  }

  /**
   * Upgrade to developer (for players who want to become developers)
   */
  @Post('upgrade')
  @Roles('PLAYER', 'DEVELOPER', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upgrade account to developer' })
  @ApiResponse({ status: 200, description: 'Account upgraded to developer' })
  async upgradeToDeveloper(@CurrentUser('id') userId: string): Promise<void> {
    await this.developerService.upgradeToDeveloper(userId);
  }
}
