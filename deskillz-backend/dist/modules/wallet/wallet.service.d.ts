import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionQueryDto, TransactionResponseDto, TransactionListResponseDto, DepositDto, WithdrawDto, BalanceResponseDto, CryptoRatesDto } from './dto/wallet.dto';
export declare class WalletService {
    private readonly prisma;
    private readonly configService;
    private readonly redis;
    private readonly walletQueue;
    private readonly logger;
    private providers;
    constructor(prisma: PrismaService, configService: ConfigService, redis: Redis, walletQueue: Queue);
    private initializeProviders;
    getTransactions(userId: string, query: TransactionQueryDto): Promise<TransactionListResponseDto>;
    getTransaction(userId: string, transactionId: string): Promise<TransactionResponseDto>;
    recordDeposit(userId: string, dto: DepositDto): Promise<TransactionResponseDto>;
    requestWithdrawal(userId: string, dto: WithdrawDto): Promise<TransactionResponseDto>;
    getBalance(userId: string, currency: string): Promise<BalanceResponseDto>;
    getAllBalances(userId: string): Promise<BalanceResponseDto[]>;
    getCryptoRates(): Promise<CryptoRatesDto[]>;
    getSupportedCurrencies(): {
        currencies: {
            symbol: string;
            name: string;
            chains: string[];
        }[];
    };
    private toTransactionResponse;
    private isValidAddress;
}
