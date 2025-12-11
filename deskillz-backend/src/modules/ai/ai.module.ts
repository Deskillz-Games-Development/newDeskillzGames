import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { AIKnowledgeService } from './ai-knowledge.service';
import { AIVoiceService } from './ai-voice.service';
import { AIAdminService } from './ai-admin.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AIController],
  providers: [
    AIService,
    AIKnowledgeService,
    AIVoiceService,
    AIAdminService,
  ],
  exports: [AIService, AIKnowledgeService],
})
export class AIModule {}
