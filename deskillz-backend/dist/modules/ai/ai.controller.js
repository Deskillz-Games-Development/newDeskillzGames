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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_service_1 = require("./ai.service");
const ai_knowledge_service_1 = require("./ai-knowledge.service");
const ai_voice_service_1 = require("./ai-voice.service");
const ai_admin_service_1 = require("./ai-admin.service");
const ai_dto_1 = require("./dto/ai.dto");
let AIController = class AIController {
    constructor(aiService, knowledgeService, voiceService, adminService) {
        this.aiService = aiService;
        this.knowledgeService = knowledgeService;
        this.voiceService = voiceService;
        this.adminService = adminService;
    }
    async chat(dto, req) {
        const userId = req.user?.id;
        return this.aiService.chat(dto, userId);
    }
    async transcribe(dto) {
        return this.voiceService.transcribe(dto.audioBase64, dto.language);
    }
    async speak(dto) {
        return this.voiceService.speak(dto.text, dto.voice);
    }
    async feedback(dto, req) {
        const userId = req.user?.id;
        await this.aiService.submitFeedback(dto, userId);
        return { success: true };
    }
    async getConversations(req) {
        const userId = req.user?.id;
        if (!userId) {
            return [];
        }
        return this.aiService.getUserConversations(userId);
    }
    async getConversation(id) {
        return this.aiService.getConversation(id);
    }
    getVoices() {
        return this.voiceService.getAvailableVoices();
    }
    async getKnowledge(category) {
        return this.knowledgeService.getAllKnowledge(category);
    }
    async createKnowledge(dto) {
        return this.knowledgeService.createKnowledge(dto);
    }
    async getStats() {
        return this.adminService.getStats();
    }
    async getKnowledgeGaps(limit) {
        return this.adminService.getKnowledgeGaps(limit);
    }
    async getLearnedPatterns(limit) {
        return this.adminService.getLearnedPatterns(limit);
    }
    async resolveKnowledgeGap(id, resolution) {
        await this.adminService.resolveKnowledgeGap(id, resolution);
        return { success: true };
    }
    async approveLearnedPattern(id) {
        await this.adminService.approveLearnedPattern(id);
        return { success: true };
    }
};
exports.AIController = AIController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a message to the AI assistant' }),
    openapi.ApiResponse({ status: 201, type: require("./dto/ai.dto").AIChatResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.AIChatRequestDto, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "chat", null);
__decorate([
    (0, common_1.Post)('transcribe'),
    (0, swagger_1.ApiOperation)({ summary: 'Convert speech to text' }),
    openapi.ApiResponse({ status: 201, type: require("./dto/ai.dto").AIVoiceTranscribeResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.AIVoiceTranscribeRequestDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "transcribe", null);
__decorate([
    (0, common_1.Post)('speak'),
    (0, swagger_1.ApiOperation)({ summary: 'Convert text to speech' }),
    openapi.ApiResponse({ status: 201, type: require("./dto/ai.dto").AIVoiceSpeakResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.AIVoiceSpeakRequestDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "speak", null);
__decorate([
    (0, common_1.Post)('feedback'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit feedback for an AI response' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.AIFeedbackRequestDto, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "feedback", null);
__decorate([
    (0, common_1.Get)('conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user conversation history' }),
    (0, swagger_1.ApiBearerAuth)(),
    openapi.ApiResponse({ status: 200, type: [require("./dto/ai.dto").AIConversationResponseDto] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific conversation' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Get)('voices'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available voice options' }),
    openapi.ApiResponse({ status: 200, type: [require("./dto/ai.dto").AIVoiceOptionDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], AIController.prototype, "getVoices", null);
__decorate([
    (0, common_1.Get)('knowledge'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all knowledge base entries' }),
    (0, swagger_1.ApiBearerAuth)(),
    openapi.ApiResponse({ status: 200, type: [require("./dto/ai.dto").AIKnowledgeResponseDto] }),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getKnowledge", null);
__decorate([
    (0, common_1.Post)('knowledge'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a knowledge base entry' }),
    (0, swagger_1.ApiBearerAuth)(),
    openapi.ApiResponse({ status: 201, type: require("./dto/ai.dto").AIKnowledgeResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.AIKnowledgeCreateDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "createKnowledge", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI assistant statistics' }),
    (0, swagger_1.ApiBearerAuth)(),
    openapi.ApiResponse({ status: 200, type: require("./dto/ai.dto").AIStatsResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('admin/knowledge-gaps'),
    (0, swagger_1.ApiOperation)({ summary: 'Get questions the AI could not answer well' }),
    (0, swagger_1.ApiBearerAuth)(),
    openapi.ApiResponse({ status: 200, type: [require("./dto/ai.dto").KnowledgeGapDto] }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getKnowledgeGaps", null);
__decorate([
    (0, common_1.Get)('admin/learned-patterns'),
    (0, swagger_1.ApiOperation)({ summary: 'Get patterns learned from user feedback' }),
    (0, swagger_1.ApiBearerAuth)(),
    openapi.ApiResponse({ status: 200, type: [require("./dto/ai.dto").LearnedPatternDto] }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getLearnedPatterns", null);
__decorate([
    (0, common_1.Post)('admin/knowledge-gaps/:id/resolve'),
    (0, swagger_1.ApiOperation)({ summary: 'Resolve a knowledge gap' }),
    (0, swagger_1.ApiBearerAuth)(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('resolution')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "resolveKnowledgeGap", null);
__decorate([
    (0, common_1.Post)('admin/learned-patterns/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a learned pattern' }),
    (0, swagger_1.ApiBearerAuth)(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "approveLearnedPattern", null);
exports.AIController = AIController = __decorate([
    (0, swagger_1.ApiTags)('AI Assistant'),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AIService,
        ai_knowledge_service_1.AIKnowledgeService,
        ai_voice_service_1.AIVoiceService,
        ai_admin_service_1.AIAdminService])
], AIController);
//# sourceMappingURL=ai.controller.js.map