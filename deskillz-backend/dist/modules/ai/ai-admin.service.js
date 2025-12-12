"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AIAdminService = class AIAdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const [totalConversations, resolvedConversations, totalMessages, helpfulFeedback, notHelpfulFeedback, knowledgeGapsCount, learnedPatternsCount, avgResponseTime,] = await Promise.all([
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
            resolutionRate: totalConversations > 0
                ? Math.round((resolvedConversations / totalConversations) * 100)
                : 0,
            totalMessages,
            helpfulFeedback,
            notHelpfulFeedback,
            feedbackScore: helpfulFeedback + notHelpfulFeedback > 0
                ? Math.round((helpfulFeedback / (helpfulFeedback + notHelpfulFeedback)) * 100)
                : 0,
            knowledgeGapsCount,
            learnedPatternsCount,
            avgResponseTimeMs: Math.round(avgResponseTime._avg.responseTimeMs || 0),
        };
    }
    async getKnowledgeGaps(limit = 20) {
        const gaps = await this.prisma.aIKnowledgeGap.findMany({
            where: { needsReview: true },
            orderBy: { timesAsked: 'desc' },
            take: limit,
        });
        return gaps.map((g) => ({
            id: g.id,
            question: g.question,
            category: g.category || undefined,
            timesAsked: g.timesAsked,
            needsReview: g.needsReview,
            createdAt: g.createdAt,
        }));
    }
    async getLearnedPatterns(limit = 20) {
        const patterns = await this.prisma.aILearnedPattern.findMany({
            orderBy: { successRate: 'desc' },
            take: limit,
        });
        return patterns.map((p) => ({
            id: p.id,
            questionPattern: p.questionPattern,
            bestResponse: p.bestResponse,
            successRate: p.successRate,
            timesAsked: p.timesAsked,
            reviewedByHuman: p.reviewedByHuman,
        }));
    }
    async resolveKnowledgeGap(gapId, resolution) {
        await this.prisma.aIKnowledgeGap.update({
            where: { id: gapId },
            data: {
                resolved: true,
                needsReview: false,
                resolution,
            },
        });
    }
    async approveLearnedPattern(patternId) {
        await this.prisma.aILearnedPattern.update({
            where: { id: patternId },
            data: { reviewedByHuman: true },
        });
    }
    async getDailyStats(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const conversations = await this.prisma.aIConversation.groupBy({
            by: ['createdAt'],
            _count: { id: true },
            where: { createdAt: { gte: startDate } },
        });
        return conversations;
    }
    async getTopPatterns(limit = 10) {
        const patterns = await this.prisma.aILearnedPattern.findMany({
            where: { successRate: { gte: 0.8 } },
            orderBy: { timesAsked: 'desc' },
            take: limit,
        });
        return patterns.map((p) => ({
            id: p.id,
            questionPattern: p.questionPattern,
            bestResponse: p.bestResponse,
            successRate: p.successRate,
            timesAsked: p.timesAsked,
            reviewedByHuman: p.reviewedByHuman,
        }));
    }
    async exportConversations(startDate, endDate) {
        const where = {};
        if (startDate)
            where.createdAt = { gte: startDate };
        if (endDate)
            where.createdAt = { ...where.createdAt, lte: endDate };
        const conversations = await this.prisma.aIConversation.findMany({
            where,
            include: {
                messages: true,
                feedback: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return conversations.map((c) => ({
            id: c.id,
            userId: c.userId,
            userRole: c.userRole,
            currentPage: c.currentPage,
            resolved: c.resolved,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            messageCount: c.messages.length,
            helpfulCount: c.feedback.filter((f) => f.rating === 'HELPFUL').length,
            notHelpfulCount: c.feedback.filter((f) => f.rating === 'NOT_HELPFUL').length,
            messages: c.messages.map((m) => ({
                role: m.role,
                content: m.content,
                provider: m.provider,
                confidence: m.confidence,
                createdAt: m.createdAt,
            })),
        }));
    }
};
exports.AIAdminService = AIAdminService;
exports.AIAdminService = AIAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AIAdminService);
//# sourceMappingURL=ai-admin.service.js.map