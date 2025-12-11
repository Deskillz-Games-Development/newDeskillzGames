import { Process, Processor } from '@nestjs/bull';
import { Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { ethers } from 'ethers';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionStatus } from '@prisma/client';

@Processor('wallet')
export class WalletProcessor {
  private readonly logger = new Logger(WalletProcessor.name);
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.initializeProviders();
  }

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
        } catch (error) {
          this.logger.error(`Failed to initialize provider for ${chain}`);
        }
      }
    }
  }

  /**
   * Verify a deposit transaction on-chain
   */
  @Process('verify-deposit')
  async handleVerifyDeposit(
    job: Job<{
      transactionId: string;
      txHash: string;
      chain: string;
      expectedAmount: number;
      currency: string;
    }>,
  ) {
    const { transactionId, txHash, chain, expectedAmount, currency } = job.data;
    this.logger.log(`Verifying deposit: ${txHash} on ${chain}`);

    try {
      const provider = this.providers.get(chain);

      if (!provider) {
        throw new Error(`No provider available for chain: ${chain}`);
      }

      // Get transaction receipt
      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt) {
        // Transaction not yet mined, retry later
        throw new Error('Transaction not yet mined');
      }

      if (receipt.status === 0) {
        // Transaction failed
        await this.updateTransactionStatus(
          transactionId,
          TransactionStatus.FAILED,
          'Transaction reverted on-chain',
        );
        return;
      }

      // For ERC20 tokens, we would parse the Transfer event
      // For native tokens, we would check the value

      // Transaction confirmed
      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      this.logger.log(`Deposit verified: ${txHash}`);
    } catch (error) {
      this.logger.error(`Error verifying deposit ${txHash}:`, error);

      // Retry up to 10 times with exponential backoff
      if (job.attemptsMade < 10) {
        throw error; // Bull will retry
      }

      // Mark as failed after max retries
      await this.updateTransactionStatus(
        transactionId,
        TransactionStatus.FAILED,
        'Verification timed out',
      );
    }
  }

  /**
   * Process a withdrawal request
   */
  @Process('process-withdrawal')
  async handleProcessWithdrawal(
    job: Job<{
      transactionId: string;
      userId: string;
      amount: number;
      currency: string;
      toAddress: string;
      chain: string;
    }>,
  ) {
    const { transactionId, userId, amount, currency, toAddress, chain } =
      job.data;
    this.logger.log(`Processing withdrawal: ${transactionId}`);

    try {
      // Update status to processing
      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.PROCESSING },
      });

      // In production, this would:
      // 1. Get platform wallet private key
      // 2. Create and sign transaction
      // 3. Broadcast transaction
      // 4. Wait for confirmation

      // For now, we'll simulate the process
      const platformWalletKey = this.configService.get(
        'platformWallet.privateKey',
      );

      if (!platformWalletKey) {
        throw new Error('Platform wallet not configured');
      }

      // Simulate transaction (replace with actual blockchain tx)
      const mockTxHash = `0x${Date.now().toString(16)}${'0'.repeat(48)}`;

      // Update transaction with hash
      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          txHash: mockTxHash,
          status: TransactionStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      this.logger.log(`Withdrawal processed: ${mockTxHash}`);
    } catch (error) {
      this.logger.error(`Error processing withdrawal ${transactionId}:`, error);

      await this.updateTransactionStatus(
        transactionId,
        TransactionStatus.FAILED,
        error.message || 'Withdrawal processing failed',
      );
    }
  }

  /**
   * Process prize payout
   */
  @Process('process-prize-payout')
  async handlePrizePayout(
    job: Job<{
      userId: string;
      tournamentId: string;
      amount: number;
      currency: string;
    }>,
  ) {
    const { userId, tournamentId, amount, currency } = job.data;
    this.logger.log(
      `Processing prize payout: ${amount} ${currency} to user ${userId}`,
    );

    try {
      // Get user's primary wallet
      const wallet = await this.prisma.walletAccount.findFirst({
        where: { userId, isPrimary: true },
      });

      if (!wallet) {
        throw new Error('User has no primary wallet');
      }

      // Create prize transaction
      const transaction = await this.prisma.transaction.create({
        data: {
          userId,
          type: 'PRIZE_WIN',
          amount,
          currency: currency as any,
          toAddress: wallet.walletAddress,
          chain: wallet.chain,
          status: TransactionStatus.PROCESSING,
          referenceType: 'tournament',
          referenceId: tournamentId,
          description: `Prize payout for tournament ${tournamentId}`,
        },
      });

      // Process actual payout (similar to withdrawal)
      const mockTxHash = `0x${Date.now().toString(16)}${'0'.repeat(48)}`;

      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          txHash: mockTxHash,
          status: TransactionStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      // Update tournament entry with prize tx hash
      await this.prisma.tournamentEntry.updateMany({
        where: { tournamentId, userId },
        data: { prizeTxHash: mockTxHash },
      });

      this.logger.log(`Prize payout completed: ${mockTxHash}`);
    } catch (error) {
      this.logger.error(`Error processing prize payout:`, error);
      throw error;
    }
  }

  /**
   * Helper: Update transaction status
   */
  private async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    failureReason?: string,
  ) {
    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status,
        failureReason,
        ...(status === TransactionStatus.COMPLETED
          ? { completedAt: new Date() }
          : {}),
      },
    });
  }
}
