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
exports.AIVoiceOptionDto = exports.LearnedPatternDto = exports.KnowledgeGapDto = exports.AIStatsResponseDto = exports.AIKnowledgeResponseDto = exports.AIConversationResponseDto = exports.AIMessageResponseDto = exports.AIVoiceSpeakResponseDto = exports.AIVoiceTranscribeResponseDto = exports.AIChatResponseDto = exports.AIKnowledgeUpdateDto = exports.AIKnowledgeCreateDto = exports.AIVoiceSpeakRequestDto = exports.AIVoiceTranscribeRequestDto = exports.AIFeedbackRequestDto = exports.AIChatRequestDto = exports.AIKnowledgeCategory = exports.AIMessageRole = exports.AIFeedbackRating = exports.AIProvider = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var AIProvider;
(function (AIProvider) {
    AIProvider["OPENAI"] = "OPENAI";
    AIProvider["CLAUDE"] = "CLAUDE";
})(AIProvider || (exports.AIProvider = AIProvider = {}));
var AIFeedbackRating;
(function (AIFeedbackRating) {
    AIFeedbackRating["HELPFUL"] = "HELPFUL";
    AIFeedbackRating["NOT_HELPFUL"] = "NOT_HELPFUL";
})(AIFeedbackRating || (exports.AIFeedbackRating = AIFeedbackRating = {}));
var AIMessageRole;
(function (AIMessageRole) {
    AIMessageRole["USER"] = "USER";
    AIMessageRole["ASSISTANT"] = "ASSISTANT";
    AIMessageRole["SYSTEM"] = "SYSTEM";
})(AIMessageRole || (exports.AIMessageRole = AIMessageRole = {}));
var AIKnowledgeCategory;
(function (AIKnowledgeCategory) {
    AIKnowledgeCategory["PLAYER_GUIDE"] = "PLAYER_GUIDE";
    AIKnowledgeCategory["DEVELOPER_SDK"] = "DEVELOPER_SDK";
    AIKnowledgeCategory["TROUBLESHOOTING"] = "TROUBLESHOOTING";
    AIKnowledgeCategory["FAQ"] = "FAQ";
    AIKnowledgeCategory["TOURNAMENT"] = "TOURNAMENT";
    AIKnowledgeCategory["WALLET"] = "WALLET";
    AIKnowledgeCategory["GENERAL"] = "GENERAL";
})(AIKnowledgeCategory || (exports.AIKnowledgeCategory = AIKnowledgeCategory = {}));
class AIChatRequestDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { message: { required: true, type: () => String }, conversationId: { required: false, type: () => String }, sessionId: { required: false, type: () => String }, currentPage: { required: false, type: () => String }, userRole: { required: false, type: () => String }, hasVoiceInput: { required: false, type: () => Boolean } };
    }
}
exports.AIChatRequestDto = AIChatRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIChatRequestDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIChatRequestDto.prototype, "conversationId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIChatRequestDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIChatRequestDto.prototype, "currentPage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIChatRequestDto.prototype, "userRole", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AIChatRequestDto.prototype, "hasVoiceInput", void 0);
class AIFeedbackRequestDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { conversationId: { required: true, type: () => String }, messageId: { required: true, type: () => String }, rating: { required: true, enum: require("./ai.dto").AIFeedbackRating }, comment: { required: false, type: () => String } };
    }
}
exports.AIFeedbackRequestDto = AIFeedbackRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIFeedbackRequestDto.prototype, "conversationId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIFeedbackRequestDto.prototype, "messageId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AIFeedbackRating),
    __metadata("design:type", String)
], AIFeedbackRequestDto.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIFeedbackRequestDto.prototype, "comment", void 0);
class AIVoiceTranscribeRequestDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { audioBase64: { required: true, type: () => String }, language: { required: false, type: () => String } };
    }
}
exports.AIVoiceTranscribeRequestDto = AIVoiceTranscribeRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIVoiceTranscribeRequestDto.prototype, "audioBase64", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIVoiceTranscribeRequestDto.prototype, "language", void 0);
class AIVoiceSpeakRequestDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { text: { required: true, type: () => String }, voice: { required: false, type: () => String } };
    }
}
exports.AIVoiceSpeakRequestDto = AIVoiceSpeakRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIVoiceSpeakRequestDto.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIVoiceSpeakRequestDto.prototype, "voice", void 0);
class AIKnowledgeCreateDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { title: { required: true, type: () => String }, content: { required: true, type: () => String }, category: { required: true, enum: require("./ai.dto").AIKnowledgeCategory }, tags: { required: false, type: () => [String] }, source: { required: false, type: () => String } };
    }
}
exports.AIKnowledgeCreateDto = AIKnowledgeCreateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIKnowledgeCreateDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIKnowledgeCreateDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AIKnowledgeCategory),
    __metadata("design:type", String)
], AIKnowledgeCreateDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AIKnowledgeCreateDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIKnowledgeCreateDto.prototype, "source", void 0);
class AIKnowledgeUpdateDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { title: { required: false, type: () => String }, content: { required: false, type: () => String }, category: { required: false, enum: require("./ai.dto").AIKnowledgeCategory }, tags: { required: false, type: () => [String] }, isActive: { required: false, type: () => Boolean } };
    }
}
exports.AIKnowledgeUpdateDto = AIKnowledgeUpdateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIKnowledgeUpdateDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIKnowledgeUpdateDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(AIKnowledgeCategory),
    __metadata("design:type", String)
], AIKnowledgeUpdateDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AIKnowledgeUpdateDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AIKnowledgeUpdateDto.prototype, "isActive", void 0);
class AIChatResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { conversationId: { required: true, type: () => String }, messageId: { required: true, type: () => String }, response: { required: true, type: () => String }, provider: { required: true, type: () => String }, confidence: { required: true, type: () => Number }, suggestedFollowUps: { required: true, type: () => [String] }, responseTimeMs: { required: true, type: () => Number } };
    }
}
exports.AIChatResponseDto = AIChatResponseDto;
class AIVoiceTranscribeResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { text: { required: true, type: () => String }, language: { required: true, type: () => String }, confidence: { required: true, type: () => Number } };
    }
}
exports.AIVoiceTranscribeResponseDto = AIVoiceTranscribeResponseDto;
class AIVoiceSpeakResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { audioBase64: { required: true, type: () => String }, format: { required: true, type: () => String }, duration: { required: true, type: () => Number } };
    }
}
exports.AIVoiceSpeakResponseDto = AIVoiceSpeakResponseDto;
class AIMessageResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, role: { required: true, type: () => String }, content: { required: true, type: () => String }, provider: { required: false, type: () => String }, confidence: { required: false, type: () => Number }, createdAt: { required: true, type: () => Date } };
    }
}
exports.AIMessageResponseDto = AIMessageResponseDto;
class AIConversationResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, title: { required: false, type: () => String }, resolved: { required: true, type: () => Boolean }, messages: { required: true, type: () => [require("./ai.dto").AIMessageResponseDto] }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
}
exports.AIConversationResponseDto = AIConversationResponseDto;
class AIKnowledgeResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, title: { required: true, type: () => String }, content: { required: true, type: () => String }, category: { required: true, type: () => String }, tags: { required: true, type: () => [String] }, isActive: { required: true, type: () => Boolean }, timesUsed: { required: true, type: () => Number }, avgHelpfulness: { required: true, type: () => Number }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
}
exports.AIKnowledgeResponseDto = AIKnowledgeResponseDto;
class AIStatsResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { totalConversations: { required: true, type: () => Number }, resolvedConversations: { required: true, type: () => Number }, resolutionRate: { required: true, type: () => Number }, totalMessages: { required: true, type: () => Number }, helpfulFeedback: { required: true, type: () => Number }, notHelpfulFeedback: { required: true, type: () => Number }, feedbackScore: { required: true, type: () => Number }, knowledgeGapsCount: { required: true, type: () => Number }, learnedPatternsCount: { required: true, type: () => Number }, avgResponseTimeMs: { required: true, type: () => Number } };
    }
}
exports.AIStatsResponseDto = AIStatsResponseDto;
class KnowledgeGapDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, question: { required: true, type: () => String }, category: { required: false, type: () => String }, timesAsked: { required: true, type: () => Number }, needsReview: { required: true, type: () => Boolean }, createdAt: { required: true, type: () => Date } };
    }
}
exports.KnowledgeGapDto = KnowledgeGapDto;
class LearnedPatternDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, questionPattern: { required: true, type: () => String }, bestResponse: { required: true, type: () => String }, successRate: { required: true, type: () => Number }, timesAsked: { required: true, type: () => Number }, reviewedByHuman: { required: true, type: () => Boolean } };
    }
}
exports.LearnedPatternDto = LearnedPatternDto;
class AIVoiceOptionDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, description: { required: true, type: () => String }, previewUrl: { required: false, type: () => String } };
    }
}
exports.AIVoiceOptionDto = AIVoiceOptionDto;
//# sourceMappingURL=ai.dto.js.map