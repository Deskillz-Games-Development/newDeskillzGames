import { PrismaService } from '../../prisma/prisma.service';
import { AIStatsResponseDto, KnowledgeGapDto, LearnedPatternDto } from './dto/ai.dto';
export declare class AIAdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<AIStatsResponseDto>;
    getKnowledgeGaps(limit?: number): Promise<KnowledgeGapDto[]>;
    getLearnedPatterns(limit?: number): Promise<LearnedPatternDto[]>;
    resolveKnowledgeGap(gapId: string, resolution: string): Promise<void>;
    approveLearnedPattern(patternId: string): Promise<void>;
    getDailyStats(days?: number): Promise<any[]>;
    getTopPatterns(limit?: number): Promise<LearnedPatternDto[]>;
    exportConversations(startDate?: Date, endDate?: Date): Promise<any[]>;
}
