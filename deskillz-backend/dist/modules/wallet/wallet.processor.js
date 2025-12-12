"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WalletProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ethers_1 = require("ethers");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let WalletProcessor = WalletProcessor_1 = class WalletProcessor {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.logger = new common_1.Logger(WalletProcessor_1.name);
        this.providers = new Map();
        this.initializeProviders();
    }
    initializeProviders() {
        const chains = {
            ethereum: this.configService.get('blockchain.ethereum'),
            polygon: this.configService.get('blockchain.polygon'),
            bsc: this.configService.get('blockchain.bsc'),
            arbitrum: this.configService.get('blockchain.arbitrum'),
        };
        for (const [chain, rpcUrl] of Object.entries(chains)) {
            if (rpcUrl) {
                try {
                    this.providers.set(chain, new ethers_1.ethers.JsonRpcProvider(rpcUrl));
                }
                catch (error) {
                    this.logger.error(`Failed to initialize provider for ${chain}`);
                }
            }
        }
    }
    async handleVerifyDeposit(job) {
        const { transactionId, txHash, chain, expectedAmount, currency } = job.data;
        this.logger.log(`Verifying deposit: ${txHash} on ${chain}`);
        try {
            const provider = this.providers.get(chain);
            if (!provider) {
                throw new Error(`No provider available for chain: ${chain}`);
            }
            const receipt = await provider.getTransactionReceipt(txHash);
            if (!receipt) {
                throw new Error('Transaction not yet mined');
            }
            if (receipt.status === 0) {
                await this.updateTransactionStatus(transactionId, client_1.TransactionStatus.FAILED, 'Transaction reverted on-chain');
                return;
            }
            await this.prisma.transaction.update({
                where: { id: transactionId },
                data: {
                    status: client_1.TransactionStatus.COMPLETED,
                    completedAt: new Date(),
                },
            });
            this.logger.log(`Deposit verified: ${txHash}`);
        }
        catch (error) {
            this.logger.error(`Error verifying deposit ${txHash}:`, error);
            if (job.attemptsMade < 10) {
                throw error;
            }
            await this.updateTransactionStatus(transactionId, client_1.TransactionStatus.FAILED, 'Verification timed out');
        }
    }
    async handleProcessWithdrawal(job) {
        const { transactionId, userId, amount, currency, toAddress, chain } = job.data;
        this.logger.log(`Processing withdrawal: ${transactionId}`);
        try {
            await this.prisma.transaction.update({
                where: { id: transactionId },
                data: { status: client_1.TransactionStatus.PROCESSING },
            });
            const platformWalletKey = this.configService.get('platformWallet.privateKey');
            if (!platformWalletKey) {
                throw new Error('Platform wallet not configured');
            }
            const mockTxHash = `0x${Date.now().toString(16)}${'0'.repeat(48)}`;
            await this.prisma.transaction.update({
                where: { id: transactionId },
                data: {
                    txHash: mockTxHash,
                    status: client_1.TransactionStatus.COMPLETED,
                    completedAt: new Date(),
                },
            });
            this.logger.log(`Withdrawal processed: ${mockTxHash}`);
        }
        catch (error) {
            this.logger.error(`Error processing withdrawal ${transactionId}:`, error);
            await this.updateTransactionStatus(transactionId, client_1.TransactionStatus.FAILED, error.message || 'Withdrawal processing failed');
        }
    }
    async handlePrizePayout(job) {
        const { userId, tournamentId, amount, currency } = job.data;
        this.logger.log(`Processing prize payout: ${amount} ${currency} to user ${userId}`);
        try {
            const wallet = await this.prisma.walletAccount.findFirst({
                where: { userId, isPrimary: true },
            });
            if (!wallet) {
                throw new Error('User has no primary wallet');
            }
            const transaction = await this.prisma.transaction.create({
                data: {
                    userId,
                    type: 'PRIZE_WIN',
                    amount,
                    currency: currency,
                    toAddress: wallet.walletAddress,
                    chain: wallet.chain,
                    status: client_1.TransactionStatus.PROCESSING,
                    referenceType: 'tournament',
                    referenceId: tournamentId,
                    description: `Prize payout for tournament ${tournamentId}`,
                },
            });
            const mockTxHash = `0x${Date.now().toString(16)}${'0'.repeat(48)}`;
            await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    txHash: mockTxHash,
                    status: client_1.TransactionStatus.COMPLETED,
                    completedAt: new Date(),
                },
            });
            await this.prisma.tournamentEntry.updateMany({
                where: { tournamentId, userId },
                data: { prizeTxHash: mockTxHash },
            });
            this.logger.log(`Prize payout completed: ${mockTxHash}`);
        }
        catch (error) {
            this.logger.error(`Error processing prize payout:`, error);
            throw error;
        }
    }
    async updateTransactionStatus(transactionId, status, failureReason) {
        await this.prisma.transaction.update({
            where: { id: transactionId },
            data: {
                status,
                failureReason,
                ...(status === client_1.TransactionStatus.COMPLETED
                    ? { completedAt: new Date() }
                    : {}),
            },
        });
    }
};
exports.WalletProcessor = WalletProcessor;
__decorate([
    (0, bull_1.Process)('verify-deposit'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletProcessor.prototype, "handleVerifyDeposit", null);
__decorate([
    (0, bull_1.Process)('process-withdrawal'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletProcessor.prototype, "handleProcessWithdrawal", null);
__decorate([
    (0, bull_1.Process)('process-prize-payout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletProcessor.prototype, "handlePrizePayout", null);
exports.WalletProcessor = WalletProcessor = WalletProcessor_1 = __decorate([
    (0, bull_1.Processor)('wallet'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], WalletProcessor);
//# sourceMappingURL=wallet.processor.js.map