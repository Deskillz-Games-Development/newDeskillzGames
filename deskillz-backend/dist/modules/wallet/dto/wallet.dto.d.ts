export declare enum TransactionType {
    DEPOSIT = "DEPOSIT",
    WITHDRAWAL = "WITHDRAWAL",
    ENTRY_FEE = "ENTRY_FEE",
    PRIZE_WIN = "PRIZE_WIN",
    REFUND = "REFUND",
    DEVELOPER_PAYOUT = "DEVELOPER_PAYOUT",
    PLATFORM_FEE = "PLATFORM_FEE"
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export declare enum CryptoCurrency {
    ETH = "ETH",
    BTC = "BTC",
    BNB = "BNB",
    SOL = "SOL",
    XRP = "XRP",
    USDT_ETH = "USDT_ETH",
    USDT_TRON = "USDT_TRON",
    USDT_BSC = "USDT_BSC",
    USDC_ETH = "USDC_ETH",
    USDC_POLYGON = "USDC_POLYGON",
    USDC_ARB = "USDC_ARB",
    USDC_BASE = "USDC_BASE"
}
export declare class TransactionQueryDto {
    page?: number;
    limit?: number;
    type?: TransactionType;
    status?: TransactionStatus;
    currency?: CryptoCurrency;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class DepositDto {
    txHash: string;
    amount: number;
    currency: CryptoCurrency;
    fromAddress: string;
    toAddress: string;
    chain: string;
}
export declare class WithdrawDto {
    amount: number;
    currency: CryptoCurrency;
    toAddress: string;
    chain: string;
}
export declare class TransactionResponseDto {
    id: string;
    type: string;
    amount: string;
    currency: string;
    txHash?: string;
    fromAddress?: string;
    toAddress?: string;
    chain?: string;
    status: string;
    failureReason?: string;
    description?: string;
    createdAt: Date;
    completedAt?: Date;
}
export declare class BalanceResponseDto {
    currency: string;
    total: string;
    available: string;
    pending: string;
}
export declare class CryptoRatesDto {
    currency: string;
    usdPrice: number;
    change24h: number;
}
export declare class PaginationDto {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export declare class TransactionListResponseDto {
    transactions: TransactionResponseDto[];
    pagination: PaginationDto;
}
export declare class SupportedCurrencyDto {
    symbol: string;
    name: string;
    chains: string[];
}
export declare class SupportedCurrenciesResponseDto {
    currencies: SupportedCurrencyDto[];
}
