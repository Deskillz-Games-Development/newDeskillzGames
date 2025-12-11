import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AIKnowledgeService } from './ai-knowledge.service';
import { AIChatRequestDto, AIChatResponseDto, AIFeedbackRequestDto, AIConversationResponseDto } from './dto/ai.dto';
export declare class AIService {
    private prisma;
    private configService;
    private knowledgeService;
    private readonly logger;
    private readonly openaiApiKey;
    private readonly claudeApiKey;
    constructor(prisma: PrismaService, configService: ConfigService, knowledgeService: AIKnowledgeService);
    chat(dto: AIChatRequestDto, userId?: string): Promise<AIChatResponseDto>;
    submitFeedback(dto: AIFeedbackRequestDto, userId?: string): Promise<void>;
    getConversation(conversationId: string): Promise<AIConversationResponseDto | null>;
    getUserConversations(userId: string): Promise<AIConversationResponseDto[]>;
    private getUserRole;
    private generateSessionId;
    private callOpenAI;
    private callClaude;
    private generateKnowledgeBasedResponse;
    private buildSystemPrompt;
    private extractFollowUps;
    private cleanResponse;
    private calculateConfidence;
    private generateFollowUpsFromKnowledge;
    private detectKnowledgeGap;
    private learnFromFeedback;
}
