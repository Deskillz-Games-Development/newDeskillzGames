import { ConfigService } from '@nestjs/config';
import { AIVoiceTranscribeResponseDto, AIVoiceSpeakResponseDto, AIVoiceOptionDto } from './dto/ai.dto';
export declare class AIVoiceService {
    private configService;
    private readonly logger;
    private readonly openaiApiKey;
    constructor(configService: ConfigService);
    transcribe(audioBase64: string, language?: string): Promise<AIVoiceTranscribeResponseDto>;
    speak(text: string, voice?: string): Promise<AIVoiceSpeakResponseDto>;
    getAvailableVoices(): AIVoiceOptionDto[];
}
