import { AIService } from './ai.service';
import { AIKnowledgeService } from './ai-knowledge.service';
import { AIVoiceService } from './ai-voice.service';
import { AIAdminService } from './ai-admin.service';
import { AIChatRequestDto, AIChatResponseDto, AIFeedbackRequestDto, AIVoiceTranscribeRequestDto, AIVoiceTranscribeResponseDto, AIVoiceSpeakRequestDto, AIVoiceSpeakResponseDto, AIConversationResponseDto, AIKnowledgeCreateDto, AIKnowledgeResponseDto, AIStatsResponseDto, KnowledgeGapDto, LearnedPatternDto, AIVoiceOptionDto } from './dto/ai.dto';
export declare class AIController {
    private aiService;
    private knowledgeService;
    private voiceService;
    private adminService;
    constructor(aiService: AIService, knowledgeService: AIKnowledgeService, voiceService: AIVoiceService, adminService: AIAdminService);
    chat(dto: AIChatRequestDto, req: any): Promise<AIChatResponseDto>;
    transcribe(dto: AIVoiceTranscribeRequestDto): Promise<AIVoiceTranscribeResponseDto>;
    speak(dto: AIVoiceSpeakRequestDto): Promise<AIVoiceSpeakResponseDto>;
    feedback(dto: AIFeedbackRequestDto, req: any): Promise<{
        success: boolean;
    }>;
    getConversations(req: any): Promise<AIConversationResponseDto[]>;
    getConversation(id: string): Promise<AIConversationResponseDto | null>;
    getVoices(): AIVoiceOptionDto[];
    getKnowledge(category?: string): Promise<AIKnowledgeResponseDto[]>;
    createKnowledge(dto: AIKnowledgeCreateDto): Promise<AIKnowledgeResponseDto>;
    getStats(): Promise<AIStatsResponseDto>;
    getKnowledgeGaps(limit?: number): Promise<KnowledgeGapDto[]>;
    getLearnedPatterns(limit?: number): Promise<LearnedPatternDto[]>;
    resolveKnowledgeGap(id: string, resolution: string): Promise<{
        success: boolean;
    }>;
    approveLearnedPattern(id: string): Promise<{
        success: boolean;
    }>;
}
