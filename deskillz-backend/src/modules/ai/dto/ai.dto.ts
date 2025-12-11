import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';

// Enums
export enum AIProvider {
  OPENAI = 'OPENAI',
  CLAUDE = 'CLAUDE',
}

export enum AIFeedbackRating {
  HELPFUL = 'HELPFUL',
  NOT_HELPFUL = 'NOT_HELPFUL',
}

export enum AIMessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

export enum AIKnowledgeCategory {
  PLAYER_GUIDE = 'PLAYER_GUIDE',
  DEVELOPER_SDK = 'DEVELOPER_SDK',
  TROUBLESHOOTING = 'TROUBLESHOOTING',
  FAQ = 'FAQ',
  TOURNAMENT = 'TOURNAMENT',
  WALLET = 'WALLET',
  GENERAL = 'GENERAL',
}

// Request DTOs
export class AIChatRequestDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  currentPage?: string;

  @IsOptional()
  @IsString()
  userRole?: string;

  @IsOptional()
  @IsBoolean()
  hasVoiceInput?: boolean;
}

export class AIFeedbackRequestDto {
  @IsString()
  conversationId: string;

  @IsString()
  messageId: string;

  @IsEnum(AIFeedbackRating)
  rating: AIFeedbackRating;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class AIVoiceTranscribeRequestDto {
  @IsString()
  audioBase64: string;

  @IsOptional()
  @IsString()
  language?: string;
}

export class AIVoiceSpeakRequestDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  voice?: string;
}

export class AIKnowledgeCreateDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsEnum(AIKnowledgeCategory)
  category: AIKnowledgeCategory;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  source?: string;
}

export class AIKnowledgeUpdateDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(AIKnowledgeCategory)
  category?: AIKnowledgeCategory;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Response DTOs
export class AIChatResponseDto {
  conversationId: string;
  messageId: string;
  response: string;
  provider: string;
  confidence: number;
  suggestedFollowUps: string[];
  responseTimeMs: number;
}

export class AIVoiceTranscribeResponseDto {
  text: string;
  language: string;
  confidence: number;
}

export class AIVoiceSpeakResponseDto {
  audioBase64: string;
  format: string;
  duration: number;
}

export class AIMessageResponseDto {
  id: string;
  role: string;
  content: string;
  provider?: string;
  confidence?: number;
  createdAt: Date;
}

export class AIConversationResponseDto {
  id: string;
  title?: string;
  resolved: boolean;
  messages: AIMessageResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class AIKnowledgeResponseDto {
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

export class AIStatsResponseDto {
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

export class KnowledgeGapDto {
  id: string;
  question: string;
  category?: string;
  timesAsked: number;
  needsReview: boolean;
  createdAt: Date;
}

export class LearnedPatternDto {
  id: string;
  questionPattern: string;
  bestResponse: string;
  successRate: number;
  timesAsked: number;
  reviewedByHuman: boolean;
}

export class AIVoiceOptionDto {
  id: string;
  name: string;
  description: string;
  previewUrl?: string;
}
