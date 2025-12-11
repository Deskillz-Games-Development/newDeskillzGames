import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AIKnowledgeCreateDto, AIKnowledgeUpdateDto, AIKnowledgeResponseDto } from './dto/ai.dto';
import { AIKnowledgeCategory } from '@prisma/client';
interface KnowledgeSearchResult {
    id: string;
    title: string;
    content: string;
    category: AIKnowledgeCategory;
    similarity?: number;
}
export declare class AIKnowledgeService implements OnModuleInit {
    private prisma;
    private configService;
    private readonly logger;
    private readonly openaiApiKey;
    constructor(prisma: PrismaService, configService: ConfigService);
    onModuleInit(): Promise<void>;
    createKnowledge(dto: AIKnowledgeCreateDto): Promise<AIKnowledgeResponseDto>;
    getAllKnowledge(category?: string): Promise<AIKnowledgeResponseDto[]>;
    incrementUsage(ids: string[]): Promise<void>;
    searchKnowledge(query: string, limit?: number): Promise<KnowledgeSearchResult[]>;
    updateKnowledge(id: string, dto: AIKnowledgeUpdateDto): Promise<AIKnowledgeResponseDto>;
    recordUsage(id: string, wasHelpful: boolean): Promise<void>;
    private generateEmbedding;
    private cosineSimilarity;
    private mapToResponseDto;
    private seedKnowledgeBase;
}
export {};
