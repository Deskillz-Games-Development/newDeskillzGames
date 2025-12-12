"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ai_controller_1 = require("./ai.controller");
const ai_service_1 = require("./ai.service");
const ai_knowledge_service_1 = require("./ai-knowledge.service");
const ai_voice_service_1 = require("./ai-voice.service");
const ai_admin_service_1 = require("./ai-admin.service");
const prisma_module_1 = require("../../prisma/prisma.module");
let AIModule = class AIModule {
};
exports.AIModule = AIModule;
exports.AIModule = AIModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, prisma_module_1.PrismaModule],
        controllers: [ai_controller_1.AIController],
        providers: [
            ai_service_1.AIService,
            ai_knowledge_service_1.AIKnowledgeService,
            ai_voice_service_1.AIVoiceService,
            ai_admin_service_1.AIAdminService,
        ],
        exports: [ai_service_1.AIService, ai_knowledge_service_1.AIKnowledgeService],
    })
], AIModule);
//# sourceMappingURL=ai.module.js.map