import { WalletService } from './wallet.service';
import { TransactionQueryDto, DepositDto, WithdrawDto, TransactionResponseDto, TransactionListResponseDto, BalanceResponseDto, CryptoRatesDto, SupportedCurrenciesResponseDto } from './dto/wallet.dto';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getSupportedCurrencies(): SupportedCurrenciesResponseDto;
    getCryptoRates(): Promise<CryptoRatesDto[]>;
    getAllBalances(userId: string): Promise<BalanceResponseDto[]>;
    getBalance(userId: string, currency: string): Promise<BalanceResponseDto>;
    getTransactions(userId: string, query: TransactionQueryDto): Promise<TransactionListResponseDto>;
    getTransaction(userId: string, id: string): Promise<TransactionResponseDto>;
    recordDeposit(userId: string, dto: DepositDto): Promise<TransactionResponseDto>;
    requestWithdrawal(userId: string, dto: WithdrawDto): Promise<TransactionResponseDto>;
}
