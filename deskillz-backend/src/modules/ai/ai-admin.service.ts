import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AIStatsResponseDto,
  KnowledgeGapDto,
  LearnedPatternDto,
} from './dto/ai.dto';

@Injectable()
export class AIAdminService {
  constructor(private prisma: PrismaService) {}

  async getStats(): Promise<AIStatsResponseDto> {
    const [
      totalConversations,
      resolvedConversations,
      totalMessages,
      helpfulFeedback,
      notHelpfulFeedback,
      knowledgeGapsCount,
      learnedPatternsCount,
      avgResponseTime,
    ] = await Promise.all([
      this.prisma.aIConversation.count(),
      this.prisma.aIConversation.count({ where: { resolved: true } }),
      this.prisma.aIMessage.count(),
      this.prisma.aIFeedback.count({ where: { rating: 'HELPFUL' } }),
      this.prisma.aIFeedback.count({ where: { rating: 'NOT_HELPFUL' } }),
      this.prisma.aIKnowledgeGap.count({ where: { needsReview: true } }),
      this.prisma.aILearnedPattern.count(),
      this.prisma.aIMessage.aggregate({
        _avg: { responseTimeMs: true },
        where: { role: 'ASSISTANT' },
      }),
    ]);

    return {
      totalConversations,
      resolvedConversations,
      resolutionRate:
        totalConversations > 0
          ? Math.round((resolvedConversations / totalConversations) * 100)
          : 0,
      totalMessages,
      helpfulFeedback,
      notHelpfulFeedback,
      feedbackScore:
        helpfulFeedback + notHelpfulFeedback > 0
          ? Math.round(
              (helpfulFeedback / (helpfulFeedback + notHelpfulFeedback)) * 100,
            )
          : 0,
      knowledgeGapsCount,
      learnedPatternsCount,
      avgResponseTimeMs: Math.round(avgResponseTime._avg.responseTimeMs || 0),
    };
  }

  async getKnowledgeGaps(limit = 20): Promise<KnowledgeGapDto[]> {
    const gaps = await this.prisma.aIKnowledgeGap.findMany({
      where: { needsReview: true },
      orderBy: { timesAsked: 'desc' },
      take: limit,
    });

    return gaps.map((g: any): KnowledgeGapDto => ({
      id: g.id,
      question: g.question,
      category: g.category || undefined,
      timesAsked: g.timesAsked,
      needsReview: g.needsReview,
      createdAt: g.createdAt,
    }));
  }

  async getLearnedPatterns(limit = 20): Promise<LearnedPatternDto[]> {
    const patterns = await this.prisma.aILearnedPattern.findMany({
      orderBy: { successRate: 'desc' },
      take: limit,
    });

    return patterns.map((p: any): LearnedPatternDto => ({
      id: p.id,
      questionPattern: p.questionPattern,
      bestResponse: p.bestResponse,
      successRate: p.successRate,
      timesAsked: p.timesAsked,
      reviewedByHuman: p.reviewedByHuman,
    }));
  }

  async resolveKnowledgeGap(
    gapId: string,
    resolution: string,
  ): Promise<void> {
    await this.prisma.aIKnowledgeGap.update({
      where: { id: gapId },
      data: {
        resolved: true,
        needsReview: false,
        resolution,
      },
    });
  }

  async approveLearnedPattern(patternId: string): Promise<void> {
    await this.prisma.aILearnedPattern.update({
      where: { id: patternId },
      data: { reviewedByHuman: true },
    });
  }

  async getDailyStats(days = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const conversations = await this.prisma.aIConversation.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: { createdAt: { gte: startDate } },
    });

    return conversations;
  }

  async getTopPatterns(limit = 10): Promise<LearnedPatternDto[]> {
    const patterns = await this.prisma.aILearnedPattern.findMany({
      where: { successRate: { gte: 0.8 } },
      orderBy: { timesAsked: 'desc' },
      take: limit,
    });

    return patterns.map((p: any): LearnedPatternDto => ({
      id: p.id,
      questionPattern: p.questionPattern,
      bestResponse: p.bestResponse,
      successRate: p.successRate,
      timesAsked: p.timesAsked,
      reviewedByHuman: p.reviewedByHuman,
    }));
  }

  async exportConversations(startDate?: Date, endDate?: Date): Promise<any[]> {
    const where: any = {};
    if (startDate) where.createdAt = { gte: startDate };
    if (endDate) where.createdAt = { ...where.createdAt, lte: endDate };

    const conversations = await this.prisma.aIConversation.findMany({
      where,
      include: {
        messages: true,
        feedback: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return conversations.map((c: any) => ({
      id: c.id,
      userId: c.userId,
      userRole: c.userRole,
      currentPage: c.currentPage,
      resolved: c.resolved,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      messageCount: c.messages.length,
      helpfulCount: c.feedback.filter((f: any) => f.rating === 'HELPFUL').length,
      notHelpfulCount: c.feedback.filter((f: any) => f.rating === 'NOT_HELPFUL').length,
      messages: c.messages.map((m: any) => ({
        role: m.role,
        content: m.content,
        provider: m.provider,
        confidence: m.confidence,
        createdAt: m.createdAt,
      })),
    }));
  }
}
