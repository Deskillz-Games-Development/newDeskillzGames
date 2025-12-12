export declare enum AIProvider {
    OPENAI = "OPENAI",
    CLAUDE = "CLAUDE"
}
export declare enum AIFeedbackRating {
    HELPFUL = "HELPFUL",
    NOT_HELPFUL = "NOT_HELPFUL"
}
export declare enum AIMessageRole {
    USER = "USER",
    ASSISTANT = "ASSISTANT",
    SYSTEM = "SYSTEM"
}
export declare enum AIKnowledgeCategory {
    PLAYER_GUIDE = "PLAYER_GUIDE",
    DEVELOPER_SDK = "DEVELOPER_SDK",
    TROUBLESHOOTING = "TROUBLESHOOTING",
    FAQ = "FAQ",
    TOURNAMENT = "TOURNAMENT",
    WALLET = "WALLET",
    GENERAL = "GENERAL"
}
export declare class AIChatRequestDto {
    message: string;
    conversationId?: string;
    sessionId?: string;
    currentPage?: string;
    userRole?: string;
    hasVoiceInput?: boolean;
}
export declare class AIFeedbackRequestDto {
    conversationId: string;
    messageId: string;
    rating: AIFeedbackRating;
    comment?: string;
}
export declare class AIVoiceTranscribeRequestDto {
    audioBase64: string;
    language?: string;
}
export declare class AIVoiceSpeakRequestDto {
    text: string;
    voice?: string;
}
export declare class AIKnowledgeCreateDto {
    title: string;
    content: string;
    category: AIKnowledgeCategory;
    tags?: string[];
    source?: string;
}
export declare class AIKnowledgeUpdateDto {
    title?: string;
    content?: string;
    category?: AIKnowledgeCategory;
    tags?: string[];
    isActive?: boolean;
}
export declare class AIChatResponseDto {
    conversationId: string;
    messageId: string;
    response: string;
    provider: string;
    confidence: number;
    suggestedFollowUps: string[];
    responseTimeMs: number;
}
export declare class AIVoiceTranscribeResponseDto {
    text: string;
    language: string;
    confidence: number;
}
export declare class AIVoiceSpeakResponseDto {
    audioBase64: string;
    format: string;
    duration: number;
}
export declare class AIMessageResponseDto {
    id: string;
    role: string;
    content: string;
    provider?: string;
    confidence?: number;
    createdAt: Date;
}
export declare class AIConversationResponseDto {
    id: string;
    title?: string;
    resolved: boolean;
    messages: AIMessageResponseDto[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class AIKnowledgeResponseDto {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    isActive: boolean;
    timesUsed: number;
    avgHelpfulness: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AIStatsResponseDto {
    totalConversations: number;
    resolvedConversations: number;
    resolutionRate: number;
    totalMessages: number;
    helpfulFeedback: number;
    notHelpfulFeedback: number;
    feedbackScore: number;
    knowledgeGapsCount: number;
    learnedPatternsCount: number;
    avgResponseTimeMs: number;
}
export declare class KnowledgeGapDto {
    id: string;
    question: string;
    category?: string;
    timesAsked: number;
    needsReview: boolean;
    createdAt: Date;
}
export declare class LearnedPatternDto {
    id: string;
    questionPattern: string;
    bestResponse: string;
    successRate: number;
    timesAsked: number;
    reviewedByHuman: boolean;
}
export declare class AIVoiceOptionDto {
    id: string;
    name: string;
    description: string;
    previewUrl?: string;
}
