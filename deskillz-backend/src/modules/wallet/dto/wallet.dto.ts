import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// ==========================================
// ENUMS
// ==========================================

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  ENTRY_FEE = 'ENTRY_FEE',
  PRIZE_WIN = 'PRIZE_WIN',
  REFUND = 'REFUND',
  DEVELOPER_PAYOUT = 'DEVELOPER_PAYOUT',
  PLATFORM_FEE = 'PLATFORM_FEE',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
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

// ==========================================
// REQUEST DTOs
// ==========================================

export class TransactionQueryDto {
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

  @ApiPropertyOptional({ enum: TransactionType })
  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @ApiPropertyOptional({ enum: TransactionStatus })
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @ApiPropertyOptional({ enum: CryptoCurrency })
  @IsEnum(CryptoCurrency)
  @IsOptional()
  currency?: CryptoCurrency;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ default: 'desc' })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class DepositDto {
  @ApiProperty({ example: '0x123...' })
  @IsString()
  txHash: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: CryptoCurrency })
  @IsEnum(CryptoCurrency)
  currency: CryptoCurrency;

  @ApiProperty({ example: '0xabc...' })
  @IsString()
  fromAddress: string;

  @ApiProperty({ example: '0xdef...' })
  @IsString()
  toAddress: string;

  @ApiProperty({ example: 'ethereum' })
  @IsString()
  chain: string;
}

export class WithdrawDto {
  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0.001)
  amount: number;

  @ApiProperty({ enum: CryptoCurrency })
  @IsEnum(CryptoCurrency)
  currency: CryptoCurrency;

  @ApiProperty({ example: '0xabc...' })
  @IsString()
  toAddress: string;

  @ApiProperty({ example: 'ethereum' })
  @IsString()
  chain: string;
}

// ==========================================
// RESPONSE DTOs
// ==========================================

export class TransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: TransactionType })
  type: string;

  @ApiProperty()
  amount: string;

  @ApiProperty({ enum: CryptoCurrency })
  currency: string;

  @ApiPropertyOptional()
  txHash?: string;

  @ApiPropertyOptional()
  fromAddress?: string;

  @ApiPropertyOptional()
  toAddress?: string;

  @ApiPropertyOptional()
  chain?: string;

  @ApiProperty({ enum: TransactionStatus })
  status: string;

  @ApiPropertyOptional()
  failureReason?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  completedAt?: Date;
}

export class BalanceResponseDto {
  @ApiProperty()
  currency: string;

  @ApiProperty()
  total: string;

  @ApiProperty()
  available: string;

  @ApiProperty()
  pending: string;
}

export class CryptoRatesDto {
  @ApiProperty()
  currency: string;

  @ApiProperty()
  usdPrice: number;

  @ApiProperty()
  change24h: number;
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

export class TransactionListResponseDto {
  @ApiProperty({ type: [TransactionResponseDto] })
  transactions: TransactionResponseDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class SupportedCurrencyDto {
  @ApiProperty()
  symbol: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [String] })
  chains: string[];
}

export class SupportedCurrenciesResponseDto {
  @ApiProperty({ type: [SupportedCurrencyDto] })
  currencies: SupportedCurrencyDto[];
}
