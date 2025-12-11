import {
  Controller,
  Get,
  Post,
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

import { WalletService } from './wallet.service';
import {
  TransactionQueryDto,
  DepositDto,
  WithdrawDto,
  TransactionResponseDto,
  TransactionListResponseDto,
  BalanceResponseDto,
  CryptoRatesDto,
  SupportedCurrenciesResponseDto,
} from './dto/wallet.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Get supported cryptocurrencies (public)
   */
  @Get('currencies')
  @Public()
  @ApiOperation({ summary: 'Get supported cryptocurrencies' })
  @ApiResponse({ status: 200, type: SupportedCurrenciesResponseDto })
  getSupportedCurrencies(): SupportedCurrenciesResponseDto {
    return this.walletService.getSupportedCurrencies();
  }

  /**
   * Get current crypto rates (public)
   */
  @Get('rates')
  @Public()
  @ApiOperation({ summary: 'Get current crypto rates' })
  @ApiResponse({ status: 200, type: [CryptoRatesDto] })
  async getCryptoRates(): Promise<CryptoRatesDto[]> {
    return this.walletService.getCryptoRates();
  }

  /**
   * Get all user balances
   */
  @Get('balances')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all user balances' })
  @ApiResponse({ status: 200, type: [BalanceResponseDto] })
  async getAllBalances(
    @CurrentUser('id') userId: string,
  ): Promise<BalanceResponseDto[]> {
    return this.walletService.getAllBalances(userId);
  }

  /**
   * Get balance for specific currency
   */
  @Get('balances/:currency')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get balance for specific currency' })
  @ApiResponse({ status: 200, type: BalanceResponseDto })
  async getBalance(
    @CurrentUser('id') userId: string,
    @Param('currency') currency: string,
  ): Promise<BalanceResponseDto> {
    return this.walletService.getBalance(userId, currency);
  }

  /**
   * Get transaction history
   */
  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiResponse({ status: 200, type: TransactionListResponseDto })
  async getTransactions(
    @CurrentUser('id') userId: string,
    @Query() query: TransactionQueryDto,
  ): Promise<TransactionListResponseDto> {
    return this.walletService.getTransactions(userId, query);
  }

  /**
   * Get single transaction
   */
  @Get('transactions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get single transaction' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async getTransaction(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionResponseDto> {
    return this.walletService.getTransaction(userId, id);
  }

  /**
   * Record a deposit
   */
  @Post('deposit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Record a deposit transaction' })
  @ApiResponse({ status: 201, type: TransactionResponseDto })
  async recordDeposit(
    @CurrentUser('id') userId: string,
    @Body() dto: DepositDto,
  ): Promise<TransactionResponseDto> {
    return this.walletService.recordDeposit(userId, dto);
  }

  /**
   * Request withdrawal
   */
  @Post('withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Request a withdrawal' })
  @ApiResponse({ status: 201, type: TransactionResponseDto })
  async requestWithdrawal(
    @CurrentUser('id') userId: string,
    @Body() dto: WithdrawDto,
  ): Promise<TransactionResponseDto> {
    return this.walletService.requestWithdrawal(userId, dto);
  }
}
