import { DeveloperService } from './developer.service';
import { DeveloperDashboardDto, GameAnalyticsDto, RevenueReportDto, SdkKeyDto, CreateSdkKeyDto, PayoutRequestDto, PayoutResponseDto } from './dto/developer.dto';
export declare class DeveloperController {
    private readonly developerService;
    constructor(developerService: DeveloperService);
    getDashboard(userId: string): Promise<DeveloperDashboardDto>;
    getGameAnalytics(userId: string, gameId: string): Promise<GameAnalyticsDto>;
    getRevenueReport(userId: string, startDate?: string, endDate?: string): Promise<RevenueReportDto>;
    generateSdkKey(userId: string, dto: CreateSdkKeyDto): Promise<SdkKeyDto>;
    listSdkKeys(userId: string): Promise<Omit<SdkKeyDto, 'apiSecret'>[]>;
    revokeSdkKey(userId: string, apiKey: string): Promise<void>;
    requestPayout(userId: string, dto: PayoutRequestDto): Promise<PayoutResponseDto>;
    upgradeToDeveloper(userId: string): Promise<void>;
}
