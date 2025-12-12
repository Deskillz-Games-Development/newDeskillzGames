import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
export declare class WalletProcessor {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    private providers;
    constructor(prisma: PrismaService, configService: ConfigService);
    private initializeProviders;
    handleVerifyDeposit(job: Job<{
        transactionId: string;
        txHash: string;
        chain: string;
        expectedAmount: number;
        currency: string;
    }>): Promise<void>;
    handleProcessWithdrawal(job: Job<{
        transactionId: string;
        userId: string;
        amount: number;
        currency: string;
        toAddress: string;
        chain: string;
    }>): Promise<void>;
    handlePrizePayout(job: Job<{
        userId: string;
        tournamentId: string;
        amount: number;
        currency: string;
    }>): Promise<void>;
    private updateTransactionStatus;
}
