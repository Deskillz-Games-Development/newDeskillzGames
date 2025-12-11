import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AIKnowledgeService } from './ai-knowledge.service';
import {
  AIChatRequestDto,
  AIChatResponseDto,
  AIFeedbackRequestDto,
  AIConversationResponseDto,
  AIMessageResponseDto,
} from './dto/ai.dto';
import { AIMessage, AIConversation } from '@prisma/client';

interface AIResponse {
  content: string;
  provider: 'OPENAI' | 'CLAUDE';
  model: string;
  tokensUsed: number;
  confidence: number;
  suggestedFollowUps: string[];
}

interface KnowledgeResult {
  id: string;
  title: string;
  content: string;
  category: string;
}

type ConversationWithMessages = AIConversation & {
  messages: AIMessage[];
};

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly openaiApiKey: string | undefined;
  private readonly claudeApiKey: string | undefined;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private knowledgeService: AIKnowledgeService,
  ) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.claudeApiKey = this.configService.get<string>('CLAUDE_API_KEY');
  }

  async chat(dto: AIChatRequestDto, userId?: string): Promise<AIChatResponseDto> {
    const startTime = Date.now();

    // Get or create conversation
    let conversation: ConversationWithMessages | null = dto.conversationId
      ? await this.prisma.aIConversation.findUnique({
          where: { id: dto.conversationId },
          include: { messages: true },
        })
      : null;

    if (!conversation) {
      const userRole = userId ? await this.getUserRole(userId) : null;
      conversation = await this.prisma.aIConversation.create({
        data: {
          sessionId: dto.sessionId || this.generateSessionId(),
          userId: userId || null,
          currentPage: dto.currentPage || null,
          userRole: userRole,
          title: null,
          resolved: false,
          escalatedToHuman: false,
        },
        include: { messages: true },
      });
    }

    // Save user message
    await this.prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: dto.message,
        hasVoiceInput: dto.hasVoiceInput || false,
        hasVoiceOutput: false,
      },
    });

    // Search knowledge base for relevant context
    const knowledgeResults: KnowledgeResult[] = await this.knowledgeService.searchKnowledge(dto.message);
    const knowledgeContext = knowledgeResults
      .map((k: KnowledgeResult) => `${k.title}: ${k.content}`)
      .join('\n\n');

    // Build context from conversation history
    const conversationHistory = conversation.messages
      .slice(-10) // Last 10 messages for context
      .map((m: AIMessage) => `${m.role}: ${m.content}`)
      .join('\n');

    // Try to get AI response
    let aiResponse: AIResponse | undefined;

    // Try OpenAI first
    if (this.openaiApiKey) {
      try {
        aiResponse = await this.callOpenAI(dto.message, knowledgeContext, conversationHistory, dto.userRole);
      } catch (error) {
        this.logger.error('OpenAI call failed', error);
      }
    }

    // Fallback to Claude
    if (!aiResponse && this.claudeApiKey) {
      try {
        aiResponse = await this.callClaude(dto.message, knowledgeContext, conversationHistory, dto.userRole);
      } catch (error) {
        this.logger.error('Claude call failed', error);
      }
    }

    // Fallback to knowledge base only
    if (!aiResponse) {
      aiResponse = this.generateKnowledgeBasedResponse(dto.message, knowledgeResults);
    }

    const responseTime = Date.now() - startTime;

    // Save assistant message
    const assistantMessage = await this.prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: aiResponse.content,
        provider: aiResponse.provider,
        model: aiResponse.model,
        tokensUsed: aiResponse.tokensUsed,
        responseTimeMs: responseTime,
        confidence: aiResponse.confidence,
        knowledgeUsed: knowledgeResults.map((k: KnowledgeResult) => k.id),
        hasVoiceInput: false,
        hasVoiceOutput: false,
      },
    });

    // Update conversation title if first message
    if (conversation.messages.length === 0) {
      await this.prisma.aIConversation.update({
        where: { id: conversation.id },
        data: { title: dto.message.substring(0, 100) },
      });
    }

    // Track knowledge usage
    if (knowledgeResults.length > 0) {
      await this.knowledgeService.incrementUsage(knowledgeResults.map((k: KnowledgeResult) => k.id));
    }

    // Detect knowledge gaps
    await this.detectKnowledgeGap(dto.message, aiResponse.confidence, conversation.id);

    return {
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      response: aiResponse.content,
      provider: aiResponse.provider,
      confidence: aiResponse.confidence,
      suggestedFollowUps: aiResponse.suggestedFollowUps,
      responseTimeMs: responseTime,
    };
  }

  async submitFeedback(dto: AIFeedbackRequestDto, userId?: string): Promise<void> {
    await this.prisma.aIFeedback.create({
      data: {
        conversationId: dto.conversationId,
        messageId: dto.messageId,
        userId: userId || null,
        rating: dto.rating,
        comment: dto.comment || null,
        wasResolved: false,
      },
    });

    // If helpful, potentially learn from this interaction
    if (dto.rating === 'HELPFUL') {
      await this.prisma.aIConversation.update({
        where: { id: dto.conversationId },
        data: { resolved: true },
      });

      // Learn from successful interaction
      await this.learnFromFeedback(dto.messageId, true);
    } else {
      // Track unsuccessful interaction for improvement
      await this.learnFromFeedback(dto.messageId, false);
    }
  }

  async getConversation(conversationId: string): Promise<AIConversationResponseDto | null> {
    const conversation = await this.prisma.aIConversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });

    if (!conversation) {
      return null;
    }

    return {
      id: conversation.id,
      title: conversation.title || undefined,
      resolved: conversation.resolved,
      messages: conversation.messages.map((m: AIMessage): AIMessageResponseDto => ({
        id: m.id,
        role: m.role,
        content: m.content,
        provider: m.provider || undefined,
        confidence: m.confidence || undefined,
        createdAt: m.createdAt,
      })),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async getUserConversations(userId: string): Promise<AIConversationResponseDto[]> {
    const conversations = await this.prisma.aIConversation.findMany({
      where: { userId },
      include: { messages: true },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    return conversations.map((c: ConversationWithMessages): AIConversationResponseDto => ({
      id: c.id,
      title: c.title || undefined,
      resolved: c.resolved,
      messages: c.messages.map((m: AIMessage): AIMessageResponseDto => ({
        id: m.id,
        role: m.role,
        content: m.content,
        provider: m.provider || undefined,
        confidence: m.confidence || undefined,
        createdAt: m.createdAt,
      })),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  private async getUserRole(userId: string): Promise<'PLAYER' | 'DEVELOPER' | 'ADMIN' | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role || null;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async callOpenAI(
    message: string,
    knowledgeContext: string,
    conversationHistory: string,
    userRole?: string,
  ): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(userRole, knowledgeContext);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(conversationHistory
            ? [{ role: 'user', content: `Previous conversation:\n${conversationHistory}` }]
            : []),
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const content = data.choices[0].message.content;
    const suggestedFollowUps = this.extractFollowUps(content);

    return {
      content: this.cleanResponse(content),
      provider: 'OPENAI',
      model: 'gpt-4-turbo-preview',
      tokensUsed: data.usage?.total_tokens || 0,
      confidence: this.calculateConfidence(content, knowledgeContext),
      suggestedFollowUps,
    };
  }

  private async callClaude(
    message: string,
    knowledgeContext: string,
    conversationHistory: string,
    userRole?: string,
  ): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(userRole, knowledgeContext);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.claudeApiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          ...(conversationHistory
            ? [{ role: 'user', content: `Previous conversation:\n${conversationHistory}` }]
            : []),
          { role: 'user', content: message },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Claude API error');
    }

    const content = data.content[0].text;
    const suggestedFollowUps = this.extractFollowUps(content);

    return {
      content: this.cleanResponse(content),
      provider: 'CLAUDE',
      model: 'claude-3-sonnet-20240229',
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens || 0,
      confidence: this.calculateConfidence(content, knowledgeContext),
      suggestedFollowUps,
    };
  }

  private generateKnowledgeBasedResponse(
    message: string,
    knowledgeResults: KnowledgeResult[],
  ): AIResponse {
    if (knowledgeResults.length === 0) {
      return {
        content:
          "I don't have specific information about that in my knowledge base. Could you please rephrase your question, or would you like me to connect you with our support team?",
        provider: 'OPENAI', // Default fallback
        model: 'knowledge-base',
        tokensUsed: 0,
        confidence: 0.3,
        suggestedFollowUps: [
          'Contact support',
          'Browse FAQ',
          'How do I get started?',
        ],
      };
    }

    const topResult = knowledgeResults[0];
    return {
      content: topResult.content,
      provider: 'OPENAI',
      model: 'knowledge-base',
      tokensUsed: 0,
      confidence: 0.7,
      suggestedFollowUps: this.generateFollowUpsFromKnowledge(knowledgeResults),
    };
  }

  private buildSystemPrompt(userRole?: string, knowledgeContext?: string): string {
    let prompt = `You are DeBot, a friendly and enthusiastic AI assistant for Deskillz.games - a Web3 competitive gaming platform.

PERSONALITY:
- You're friendly, casual, and fun to talk to - like a helpful gaming buddy
- Use a conversational tone, not robotic corporate speak
- You can use gaming slang occasionally (GG, let's go, etc.)
- Show enthusiasm about gaming and competition
- Keep responses SHORT unless the user asks for detailed help
- Match the user's energy - if they say "hi", just say hi back warmly!

CONVERSATION RULES:
1. For GREETINGS (hi, hello, hey, what's up, yo):
   - Respond with a warm, brief greeting
   - Ask how you can help or what they're looking for
   - Do NOT dump instructions unless they ask
   - Example: "Hey! 👋 Welcome to Deskillz! What can I help you with today?"

2. For CASUAL CHAT (how are you, what's good, etc.):
   - Respond naturally and briefly
   - Be personable, maybe mention being excited about gaming
   - Example: "I'm doing great! Always pumped to help gamers. What's on your mind?"

3. For ACTUAL QUESTIONS (how do I, what is, can I, help me):
   - Now provide helpful, detailed answers
   - Be thorough but not overwhelming
   - Use bullet points only if listing multiple steps

4. For UNCLEAR MESSAGES:
   - Ask a clarifying question instead of guessing
   - Example: "I want to make sure I help you with the right thing - are you looking to play games or integrate your own game as a developer?"

PLATFORM KNOWLEDGE (use only when relevant):
- WEBSITE (deskillz.games) = Informational only - browse games, download apps, manage profile
- GAME APPS (Android/iOS) = Where tournaments happen - join, play, win prizes
- Players DOWNLOAD game apps and join tournaments FROM WITHIN THE GAME
- Supported crypto: ETH, BTC, BNB, SOL, XRP, USDT, USDC
- Developers use Unity/Unreal SDK (70/30 revenue split)

RESPONSE LENGTH:
- Greetings: 1-2 sentences max
- Simple questions: 2-4 sentences
- Complex how-to questions: Use steps, but keep it scannable
- Never write walls of text unless specifically asked for detailed guides

`;

    if (userRole) {
      prompt += `\nThe user is a ${userRole.toLowerCase()}. Tailor your responses accordingly.\n`;
    }

    if (knowledgeContext) {
      prompt += `\nRelevant knowledge base information:\n${knowledgeContext}\n\nUse this information to provide accurate answers.\n`;
    }

    prompt += `\nAt the end of your response, suggest 2-3 relevant follow-up questions the user might want to ask, formatted as:
[FOLLOW_UPS]
- Question 1
- Question 2
- Question 3
[/FOLLOW_UPS]`;

    return prompt;
  }

  private extractFollowUps(content: string): string[] {
    const followUpMatch = content.match(/\[FOLLOW_UPS\]([\s\S]*?)\[\/FOLLOW_UPS\]/);
    if (!followUpMatch) {
      return [];
    }

    return followUpMatch[1]
      .split('\n')
      .map((line: string) => line.replace(/^-\s*/, '').trim())
      .filter((line: string) => line.length > 0);
  }

  private cleanResponse(content: string): string {
    return content.replace(/\[FOLLOW_UPS\][\s\S]*?\[\/FOLLOW_UPS\]/, '').trim();
  }

  private calculateConfidence(response: string, knowledgeContext: string): number {
    // Simple confidence calculation based on knowledge overlap
    if (!knowledgeContext) return 0.5;

    const responseWords = new Set(response.toLowerCase().split(/\s+/));
    const knowledgeWords = new Set(knowledgeContext.toLowerCase().split(/\s+/));

    let overlap = 0;
    responseWords.forEach((word: string) => {
      if (knowledgeWords.has(word)) overlap++;
    });

    const confidence = Math.min(0.95, 0.5 + (overlap / responseWords.size) * 0.5);
    return Math.round(confidence * 100) / 100;
  }

  private generateFollowUpsFromKnowledge(knowledgeResults: KnowledgeResult[]): string[] {
    const categories = [...new Set(knowledgeResults.map((k: KnowledgeResult) => k.category))];
    const followUps: string[] = [];

    if (categories.includes('WALLET')) {
      followUps.push('How do I connect my wallet?');
    }
    if (categories.includes('TOURNAMENT')) {
      followUps.push('How do tournaments work?');
    }
    if (categories.includes('DEVELOPER_SDK')) {
      followUps.push('How do I integrate the SDK?');
    }

    return followUps.slice(0, 3);
  }

  private async detectKnowledgeGap(
    question: string,
    confidence: number,
    conversationId: string,
  ): Promise<void> {
    if (confidence < 0.5) {
      const existingGap = await this.prisma.aIKnowledgeGap.findFirst({
        where: {
          question: { contains: question.substring(0, 50), mode: 'insensitive' },
        },
      });

      if (existingGap) {
        await this.prisma.aIKnowledgeGap.update({
          where: { id: existingGap.id },
          data: { timesAsked: { increment: 1 } },
        });
      } else {
        await this.prisma.aIKnowledgeGap.create({
          data: {
            question,
            conversationId,
            needsReview: true,
            timesAsked: 1,
            resolved: false,
          },
        });
      }
    }
  }

  private async learnFromFeedback(messageId: string, wasHelpful: boolean): Promise<void> {
    const message = await this.prisma.aIMessage.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            messages: {
              where: { role: 'USER' },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!message || message.role !== 'ASSISTANT') return;

    const userQuestion = message.conversation.messages[0]?.content;
    if (!userQuestion) return;

    if (wasHelpful) {
      // Store as learned pattern
      const existingPattern = await this.prisma.aILearnedPattern.findFirst({
        where: {
          questionPattern: { contains: userQuestion.substring(0, 50), mode: 'insensitive' },
        },
      });

      if (existingPattern) {
        const newTotal = existingPattern.totalFeedback + 1;
        const newSuccessRate =
          (existingPattern.successRate * existingPattern.totalFeedback + 1) / newTotal;

        await this.prisma.aILearnedPattern.update({
          where: { id: existingPattern.id },
          data: {
            timesAsked: { increment: 1 },
            totalFeedback: newTotal,
            successRate: newSuccessRate,
            bestResponse:
              newSuccessRate > existingPattern.successRate
                ? message.content
                : existingPattern.bestResponse,
          },
        });
      } else {
        await this.prisma.aILearnedPattern.create({
          data: {
            questionPattern: userQuestion,
            bestResponse: message.content,
            responseSource: message.provider || 'UNKNOWN',
            category: 'GENERAL',
            timesAsked: 1,
            successRate: 1.0,
            totalFeedback: 1,
            autoGenerated: true,
            reviewedByHuman: false,
          },
        });
      }
    } else {
      // Create knowledge gap for review
      await this.prisma.aIKnowledgeGap.create({
        data: {
          question: userQuestion,
          conversationId: message.conversationId,
          needsReview: true,
          timesAsked: 1,
          resolved: false,
        },
      });
    }
  }
}