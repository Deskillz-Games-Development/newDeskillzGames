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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WalletService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const ioredis_1 = require("ioredis");
const ethers_1 = require("ethers");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_module_1 = require("../../config/redis.module");
const client_1 = require("@prisma/client");
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
let WalletService = WalletService_1 = class WalletService {
    constructor(prisma, configService, redis, walletQueue) {
        this.prisma = prisma;
        this.configService = configService;
        this.redis = redis;
        this.walletQueue = walletQueue;
        this.logger = new common_1.Logger(WalletService_1.name);
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
                    this.logger.log(`Initialized provider for ${chain}`);
                }
                catch (error) {
                    this.logger.error(`Failed to initialize provider for ${chain}`, error);
                }
            }
        }
    }
    async getTransactions(userId, query) {
        const { page = 1, limit = 20, type, status, currency, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        if (currency)
            where.currency = currency;
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
    async getTransaction(userId, transactionId) {
        const transaction = await this.prisma.transaction.findFirst({
            where: { id: transactionId, userId },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return this.toTransactionResponse(transaction);
    }
    async recordDeposit(userId, dto) {
        const existingTx = await this.prisma.transaction.findUnique({
            where: { txHash: dto.txHash },
        });
        if (existingTx) {
            throw new common_1.BadRequestException('Transaction already recorded');
        }
        const transaction = await this.prisma.transaction.create({
            data: {
                userId,
                type: client_1.TransactionType.DEPOSIT,
                amount: dto.amount,
                currency: dto.currency,
                txHash: dto.txHash,
                fromAddress: dto.fromAddress,
                toAddress: dto.toAddress,
                chain: dto.chain,
                status: client_1.TransactionStatus.PENDING,
                description: `Deposit ${dto.amount} ${dto.currency}`,
            },
        });
        await this.walletQueue.add('verify-deposit', {
            transactionId: transaction.id,
            txHash: dto.txHash,
            chain: dto.chain,
            expectedAmount: dto.amount,
            currency: dto.currency,
        });
        return this.toTransactionResponse(transaction);
    }
    async requestWithdrawal(userId, dto) {
        const balance = await this.getBalance(userId, dto.currency);
        if (parseFloat(balance.available) < dto.amount) {
            throw new common_1.BadRequestException('Insufficient balance');
        }
        if (!this.isValidAddress(dto.toAddress, dto.chain)) {
            throw new common_1.BadRequestException('Invalid destination address');
        }
        const transaction = await this.prisma.transaction.create({
            data: {
                userId,
                type: client_1.TransactionType.WITHDRAWAL,
                amount: dto.amount,
                currency: dto.currency,
                toAddress: dto.toAddress,
                chain: dto.chain,
                status: client_1.TransactionStatus.PENDING,
                description: `Withdrawal ${dto.amount} ${dto.currency} to ${dto.toAddress}`,
            },
        });
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
    async getBalance(userId, currency) {
        const deposits = await this.prisma.transaction.aggregate({
            where: {
                userId,
                currency: currency,
                type: { in: [client_1.TransactionType.DEPOSIT, client_1.TransactionType.PRIZE_WIN, client_1.TransactionType.REFUND] },
                status: client_1.TransactionStatus.COMPLETED,
            },
            _sum: { amount: true },
        });
        const withdrawals = await this.prisma.transaction.aggregate({
            where: {
                userId,
                currency: currency,
                type: { in: [client_1.TransactionType.WITHDRAWAL, client_1.TransactionType.ENTRY_FEE] },
                status: client_1.TransactionStatus.COMPLETED,
            },
            _sum: { amount: true },
        });
        const pendingWithdrawals = await this.prisma.transaction.aggregate({
            where: {
                userId,
                currency: currency,
                type: client_1.TransactionType.WITHDRAWAL,
                status: { in: [client_1.TransactionStatus.PENDING, client_1.TransactionStatus.PROCESSING] },
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
    async getAllBalances(userId) {
        const currencies = await this.prisma.transaction.findMany({
            where: { userId },
            select: { currency: true },
            distinct: ['currency'],
        });
        const balances = await Promise.all(currencies.map((c) => this.getBalance(userId, c.currency)));
        return balances.filter((b) => parseFloat(b.total) > 0);
    }
    async getCryptoRates() {
        const cached = await this.redis.get('crypto:rates');
        if (cached) {
            return JSON.parse(cached);
        }
        const rates = [
            { currency: 'BTC', usdPrice: 43000, change24h: 2.5 },
            { currency: 'ETH', usdPrice: 2200, change24h: 1.8 },
            { currency: 'SOL', usdPrice: 100, change24h: 5.2 },
            { currency: 'BNB', usdPrice: 310, change24h: -0.5 },
            { currency: 'XRP', usdPrice: 0.62, change24h: 3.1 },
            { currency: 'USDT', usdPrice: 1.0, change24h: 0 },
            { currency: 'USDC', usdPrice: 1.0, change24h: 0 },
        ];
        await this.redis.setex('crypto:rates', 300, JSON.stringify(rates));
        return rates;
    }
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
    toTransactionResponse(transaction) {
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
    isValidAddress(address, chain) {
        try {
            switch (chain) {
                case 'ethereum':
                case 'polygon':
                case 'bsc':
                case 'arbitrum':
                case 'base':
                    return ethers_1.ethers.isAddress(address);
                case 'bitcoin':
                    return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
                case 'solana':
                    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
                case 'tron':
                    return /^T[a-zA-Z0-9]{33}$/.test(address);
                default:
                    return false;
            }
        }
        catch {
            return false;
        }
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = WalletService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __param(3, (0, bull_1.InjectQueue)('wallet')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        ioredis_1.default, Object])
], WalletService);
//# sourceMappingURL=wallet.service.js.map