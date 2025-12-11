import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import Redis from 'ioredis';
import { ethers } from 'ethers';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import { TransactionStatus, TransactionType, Prisma } from '@prisma/client';
import {
  TransactionQueryDto,
  TransactionResponseDto,
  TransactionListResponseDto,
  DepositDto,
  WithdrawDto,
  BalanceResponseDto,
  CryptoRatesDto,
} from './dto/wallet.dto';

// Supported tokens by chain
const SUPPORTED_TOKENS = {
  ethereum: ['ETH', 'USDT_ETH', 'USDC_ETH'],
  polygon: ['MATIC', 'USDC_POLYGON'],
  bsc: ['BNB', 'USDT_BSC'],
  arbitrum: ['ETH', 'USDC_ARB'],
  base: ['ETH', 'USDC_BASE'],
  tron: ['TRX', 'USDT_TRON'],
  bitcoin: ['BTC'],
  solana: ['SOL'],
};

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @InjectQueue('wallet') private readonly walletQueue: Queue,
  ) {
    this.initializeProviders();
  }

  /**
   * Initialize blockchain providers
   */
  private initializeProviders() {
    const chains = {
      ethereum: this.configService.get('blockchain.ethereum'),
      polygon: this.configService.get('blockchain.polygon'),
      bsc: this.configService.get('blockchain.bsc'),
      arbitrum: this.configService.get('blockchain.arbitrum'),
    };

    for (const [chain, rpcUrl] of Object.entries(chains)) {
      if (rpcUrl) {
        try {
          this.providers.set(chain, new ethers.JsonRpcProvider(rpcUrl));
          this.logger.log(`Initialized provider for ${chain}`);
        } catch (error) {
          this.logger.error(`Failed to initialize provider for ${chain}`, error);
        }
      }
    }
  }

  /**
   * Get user's transaction history
   */
  async getTransactions(
    userId: string,
    query: TransactionQueryDto,
  ): Promise<TransactionListResponseDto> {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      currency,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = { userId };

    if (type) where.type = type;
    if (status) where.status = status;
    if (currency) where.currency = currency;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      transactions: transactions.map((t) => this.toTransactionResponse(t)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single transaction by ID
   */
  async getTransaction(
    userId: string,
    transactionId: string,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.toTransactionResponse(transaction);
  }

  /**
   * Verify and record a deposit
   */
  async recordDeposit(userId: string, dto: DepositDto): Promise<TransactionResponseDto> {
    // Check for duplicate transaction
    const existingTx = await this.prisma.transaction.findUnique({
      where: { txHash: dto.txHash },
    });

    if (existingTx) {
      throw new BadRequestException('Transaction already recorded');
    }

    // Create pending transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        type: TransactionType.DEPOSIT,
        amount: dto.amount,
        currency: dto.currency as any,
        txHash: dto.txHash,
        fromAddress: dto.fromAddress,
        toAddress: dto.toAddress,
        chain: dto.chain,
        status: TransactionStatus.PENDING,
        description: `Deposit ${dto.amount} ${dto.currency}`,
      },
    });

    // Queue verification job
    await this.walletQueue.add('verify-deposit', {
      transactionId: transaction.id,
      txHash: dto.txHash,
      chain: dto.chain,
      expectedAmount: dto.amount,
      currency: dto.currency,
    });

    return this.toTransactionResponse(transaction);
  }

  /**
   * Request withdrawal
   */
  async requestWithdrawal(
    userId: string,
    dto: WithdrawDto,
  ): Promise<TransactionResponseDto> {
    // Verify user has sufficient balance
    const balance = await this.getBalance(userId, dto.currency);

    if (parseFloat(balance.available) < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Validate destination address
    if (!this.isValidAddress(dto.toAddress, dto.chain)) {
      throw new BadRequestException('Invalid destination address');
    }

    // Create withdrawal request
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        type: TransactionType.WITHDRAWAL,
        amount: dto.amount,
        currency: dto.currency as any,
        toAddress: dto.toAddress,
        chain: dto.chain,
        status: TransactionStatus.PENDING,
        description: `Withdrawal ${dto.amount} ${dto.currency} to ${dto.toAddress}`,
      },
    });

    // Queue withdrawal processing
    await this.walletQueue.add('process-withdrawal', {
      transactionId: transaction.id,
      userId,
      amount: dto.amount,
      currency: dto.currency,
      toAddress: dto.toAddress,
      chain: dto.chain,
    });

    return this.toTransactionResponse(transaction);
  }

  /**
   * Get user balance for a specific currency
   */
  async getBalance(userId: string, currency: string): Promise<BalanceResponseDto> {
    // Calculate balance from completed transactions
    const deposits = await this.prisma.transaction.aggregate({
      where: {
        userId,
        currency: currency as any,
        type: { in: [TransactionType.DEPOSIT, TransactionType.PRIZE_WIN, TransactionType.REFUND] },
        status: TransactionStatus.COMPLETED,
      },
      _sum: { amount: true },
    });

    const withdrawals = await this.prisma.transaction.aggregate({
      where: {
        userId,
        currency: currency as any,
        type: { in: [TransactionType.WITHDRAWAL, TransactionType.ENTRY_FEE] },
        status: TransactionStatus.COMPLETED,
      },
      _sum: { amount: true },
    });

    const pendingWithdrawals = await this.prisma.transaction.aggregate({
      where: {
        userId,
        currency: currency as any,
        type: TransactionType.WITHDRAWAL,
        status: { in: [TransactionStatus.PENDING, TransactionStatus.PROCESSING] },
      },
      _sum: { amount: true },
    });

    const totalDeposits = parseFloat(deposits._sum.amount?.toString() || '0');
    const totalWithdrawals = parseFloat(withdrawals._sum.amount?.toString() || '0');
    const pending = parseFloat(pendingWithdrawals._sum.amount?.toString() || '0');

    const total = totalDeposits - totalWithdrawals;
    const available = total - pending;

    return {
      currency,
      total: total.toFixed(8),
      available: available.toFixed(8),
      pending: pending.toFixed(8),
    };
  }

  /**
   * Get all user balances
   */
  async getAllBalances(userId: string): Promise<BalanceResponseDto[]> {
    // Get all currencies user has transacted with
    const currencies = await this.prisma.transaction.findMany({
      where: { userId },
      select: { currency: true },
      distinct: ['currency'],
    });

    const balances = await Promise.all(
      currencies.map((c) => this.getBalance(userId, c.currency)),
    );

    // Filter out zero balances
    return balances.filter((b) => parseFloat(b.total) > 0);
  }

  /**
   * Get current crypto rates (placeholder - would integrate with price API)
   */
  async getCryptoRates(): Promise<CryptoRatesDto[]> {
    // In production, this would fetch from CoinGecko, CoinMarketCap, etc.
    const cached = await this.redis.get('crypto:rates');
    if (cached) {
      return JSON.parse(cached);
    }

    // Placeholder rates - would be fetched from external API
    const rates: CryptoRatesDto[] = [
      { currency: 'BTC', usdPrice: 43000, change24h: 2.5 },
      { currency: 'ETH', usdPrice: 2200, change24h: 1.8 },
      { currency: 'SOL', usdPrice: 100, change24h: 5.2 },
      { currency: 'BNB', usdPrice: 310, change24h: -0.5 },
      { currency: 'XRP', usdPrice: 0.62, change24h: 3.1 },
      { currency: 'USDT', usdPrice: 1.0, change24h: 0 },
      { currency: 'USDC', usdPrice: 1.0, change24h: 0 },
    ];

    // Cache for 5 minutes
    await this.redis.setex('crypto:rates', 300, JSON.stringify(rates));

    return rates;
  }

  /**
   * Get supported cryptocurrencies
   */
  getSupportedCurrencies() {
    return {
      currencies: [
        { symbol: 'BTC', name: 'Bitcoin', chains: ['bitcoin'] },
        { symbol: 'ETH', name: 'Ethereum', chains: ['ethereum', 'arbitrum', 'base'] },
        { symbol: 'SOL', name: 'Solana', chains: ['solana'] },
        { symbol: 'BNB', name: 'BNB', chains: ['bsc'] },
        { symbol: 'XRP', name: 'XRP', chains: ['xrp'] },
        { symbol: 'USDT', name: 'Tether', chains: ['ethereum', 'tron', 'bsc'] },
        { symbol: 'USDC', name: 'USD Coin', chains: ['ethereum', 'polygon', 'arbitrum', 'base'] },
      ],
    };
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  private toTransactionResponse(transaction: any): TransactionResponseDto {
    return {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount.toString(),
      currency: transaction.currency,
      txHash: transaction.txHash,
      fromAddress: transaction.fromAddress,
      toAddress: transaction.toAddress,
      chain: transaction.chain,
      status: transaction.status,
      failureReason: transaction.failureReason,
      description: transaction.description,
      createdAt: transaction.createdAt,
      completedAt: transaction.completedAt,
    };
  }

  private isValidAddress(address: string, chain: string): boolean {
    try {
      switch (chain) {
        case 'ethereum':
        case 'polygon':
        case 'bsc':
        case 'arbitrum':
        case 'base':
          return ethers.isAddress(address);
        case 'bitcoin':
          // Basic Bitcoin address validation
          return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
        case 'solana':
          // Basic Solana address validation (base58, 32-44 chars)
          return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
        case 'tron':
          // Tron address starts with T
          return /^T[a-zA-Z0-9]{33}$/.test(address);
        default:
          return false;
      }
    } catch {
      return false;
    }
  }
}
