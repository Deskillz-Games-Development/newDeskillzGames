import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import {
  UpdateUserDto,
  AddWalletDto,
  UserResponseDto,
  UserStatsDto,
} from './dto/users.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user profile
   */
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getProfile(@CurrentUser('id') userId: string): Promise<UserResponseDto> {
    return this.usersService.findById(userId);
  }

  /**
   * Update current user profile
   */
  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(userId, dto);
  }

  /**
   * Get current user stats
   */
  @Get('me/stats')
  @ApiOperation({ summary: 'Get current user statistics' })
  @ApiResponse({ status: 200, type: UserStatsDto })
  async getMyStats(@CurrentUser('id') userId: string): Promise<UserStatsDto> {
    return this.usersService.getStats(userId);
  }

  /**
   * Get current user's wallets
   */
  @Get('me/wallets')
  @ApiOperation({ summary: 'Get current user wallets' })
  @ApiResponse({ status: 200 })
  async getMyWallets(@CurrentUser('id') userId: string) {
    return this.usersService.getWallets(userId);
  }

  /**
   * Add wallet to current user
   */
  @Post('me/wallets')
  @ApiOperation({ summary: 'Add wallet to current user' })
  @ApiResponse({ status: 201 })
  async addWallet(
    @CurrentUser('id') userId: string,
    @Body() dto: AddWalletDto,
  ) {
    return this.usersService.addWallet(
      userId,
      dto.walletAddress,
      dto.chain,
      dto.walletType,
    );
  }

  /**
   * Remove wallet from current user
   */
  @Delete('me/wallets/:walletId')
  @ApiOperation({ summary: 'Remove wallet from current user' })
  @ApiResponse({ status: 204 })
  async removeWallet(
    @CurrentUser('id') userId: string,
    @Param('walletId', ParseUUIDPipe) walletId: string,
  ) {
    await this.usersService.removeWallet(userId, walletId);
  }

  /**
   * Get user by username (public profile)
   */
  @Get('username/:username')
  @ApiOperation({ summary: 'Get user by username' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getUserByUsername(
    @Param('username') username: string,
  ): Promise<UserResponseDto> {
    return this.usersService.findByUsername(username);
  }

  /**
   * Get user by ID (public profile)
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getUserById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  /**
   * Get user stats by ID
   */
  @Get(':id/stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, type: UserStatsDto })
  async getUserStats(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserStatsDto> {
    return this.usersService.getStats(id);
  }
}
