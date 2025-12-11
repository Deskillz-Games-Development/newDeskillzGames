import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { DeveloperDashboardDto, GameAnalyticsDto, RevenueReportDto, SdkKeyDto, CreateSdkKeyDto, PayoutRequestDto, PayoutResponseDto } from './dto/developer.dto';
export declare class DeveloperService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: Redis);
    getDashboard(developerId: string): Promise<DeveloperDashboardDto>;
    getGameAnalytics(developerId: string, gameId: string): Promise<GameAnalyticsDto>;
    getRevenueReport(developerId: string, startDate?: Date, endDate?: Date): Promise<RevenueReportDto>;
    generateSdkKey(developerId: string, dto: CreateSdkKeyDto): Promise<SdkKeyDto>;
    listSdkKeys(developerId: string): Promise<Omit<SdkKeyDto, 'apiSecret'>[]>;
    revokeSdkKey(developerId: string, apiKey: string): Promise<void>;
    requestPayout(developerId: string, dto: PayoutRequestDto): Promise<PayoutResponseDto>;
    upgradeToDeveloper(userId: string): Promise<void>;
}
