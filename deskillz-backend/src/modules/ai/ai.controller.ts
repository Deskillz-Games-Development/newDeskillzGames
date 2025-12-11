import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { AIKnowledgeService } from './ai-knowledge.service';
import { AIVoiceService } from './ai-voice.service';
import { AIAdminService } from './ai-admin.service';
import {
  AIChatRequestDto,
  AIChatResponseDto,
  AIFeedbackRequestDto,
  AIVoiceTranscribeRequestDto,
  AIVoiceTranscribeResponseDto,
  AIVoiceSpeakRequestDto,
  AIVoiceSpeakResponseDto,
  AIConversationResponseDto,
  AIKnowledgeCreateDto,
  AIKnowledgeResponseDto,
  AIStatsResponseDto,
  KnowledgeGapDto,
  LearnedPatternDto,
  AIVoiceOptionDto,
} from './dto/ai.dto';
// Uncomment these when you have the guards set up:
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('AI Assistant')
@Controller('ai')
export class AIController {
  constructor(
    private aiService: AIService,
    private knowledgeService: AIKnowledgeService,
    private voiceService: AIVoiceService,
    private adminService: AIAdminService,
  ) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a message to the AI assistant' })
  async chat(
    @Body() dto: AIChatRequestDto,
    @Request() req: any,
  ): Promise<AIChatResponseDto> {
    const userId = req.user?.id;
    return this.aiService.chat(dto, userId);
  }

  @Post('transcribe')
  @ApiOperation({ summary: 'Convert speech to text' })
  async transcribe(
    @Body() dto: AIVoiceTranscribeRequestDto,
  ): Promise<AIVoiceTranscribeResponseDto> {
    return this.voiceService.transcribe(dto.audioBase64, dto.language);
  }

  @Post('speak')
  @ApiOperation({ summary: 'Convert text to speech' })
  async speak(
    @Body() dto: AIVoiceSpeakRequestDto,
  ): Promise<AIVoiceSpeakResponseDto> {
    return this.voiceService.speak(dto.text, dto.voice);
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Submit feedback for an AI response' })
  async feedback(
    @Body() dto: AIFeedbackRequestDto,
    @Request() req: any,
  ): Promise<{ success: boolean }> {
    const userId = req.user?.id;
    await this.aiService.submitFeedback(dto, userId);
    return { success: true };
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversation history' })
  // @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getConversations(
    @Request() req: any,
  ): Promise<AIConversationResponseDto[]> {
    const userId = req.user?.id;
    if (!userId) {
      return [];
    }
    return this.aiService.getUserConversations(userId);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a specific conversation' })
  async getConversation(
    @Param('id') id: string,
  ): Promise<AIConversationResponseDto | null> {
    return this.aiService.getConversation(id);
  }

  @Get('voices')
  @ApiOperation({ summary: 'Get available voice options' })
  getVoices(): AIVoiceOptionDto[] {
    return this.voiceService.getAvailableVoices();
  }

  // Knowledge Base Management (Admin)
  @Get('knowledge')
  @ApiOperation({ summary: 'Get all knowledge base entries' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @ApiBearerAuth()
  async getKnowledge(
    @Query('category') category?: string,
  ): Promise<AIKnowledgeResponseDto[]> {
    return this.knowledgeService.getAllKnowledge(category);
  }

  @Post('knowledge')
  @ApiOperation({ summary: 'Add a knowledge base entry' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @ApiBearerAuth()
  async createKnowledge(
    @Body() dto: AIKnowledgeCreateDto,
  ): Promise<AIKnowledgeResponseDto> {
    return this.knowledgeService.createKnowledge(dto);
  }

  // Admin Analytics
  @Get('admin/stats')
  @ApiOperation({ summary: 'Get AI assistant statistics' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @ApiBearerAuth()
  async getStats(): Promise<AIStatsResponseDto> {
    return this.adminService.getStats();
  }

  @Get('admin/knowledge-gaps')
  @ApiOperation({ summary: 'Get questions the AI could not answer well' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @ApiBearerAuth()
  async getKnowledgeGaps(
    @Query('limit') limit?: number,
  ): Promise<KnowledgeGapDto[]> {
    return this.adminService.getKnowledgeGaps(limit);
  }

  @Get('admin/learned-patterns')
  @ApiOperation({ summary: 'Get patterns learned from user feedback' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @ApiBearerAuth()
  async getLearnedPatterns(
    @Query('limit') limit?: number,
  ): Promise<LearnedPatternDto[]> {
    return this.adminService.getLearnedPatterns(limit);
  }

  @Post('admin/knowledge-gaps/:id/resolve')
  @ApiOperation({ summary: 'Resolve a knowledge gap' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @ApiBearerAuth()
  async resolveKnowledgeGap(
    @Param('id') id: string,
    @Body('resolution') resolution: string,
  ): Promise<{ success: boolean }> {
    await this.adminService.resolveKnowledgeGap(id, resolution);
    return { success: true };
  }

  @Post('admin/learned-patterns/:id/approve')
  @ApiOperation({ summary: 'Approve a learned pattern' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @ApiBearerAuth()
  async approveLearnedPattern(
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    await this.adminService.approveLearnedPattern(id);
    return { success: true };
  }
}
