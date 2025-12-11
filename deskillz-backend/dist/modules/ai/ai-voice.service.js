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
var AIVoiceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIVoiceService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AIVoiceService = AIVoiceService_1 = class AIVoiceService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AIVoiceService_1.name);
        this.openaiApiKey = this.configService.get('OPENAI_API_KEY');
    }
    async transcribe(audioBase64, language) {
        if (!this.openaiApiKey) {
            throw new Error('OpenAI API key not configured for voice transcription');
        }
        try {
            const audioBuffer = Buffer.from(audioBase64, 'base64');
            const formData = new FormData();
            formData.append('file', new Blob([audioBuffer]), 'audio.webm');
            formData.append('model', 'whisper-1');
            if (language) {
                formData.append('language', language);
            }
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.openaiApiKey}`,
                },
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || 'Transcription failed');
            }
            return {
                text: data.text,
                language: language || 'en',
                confidence: 0.95,
            };
        }
        catch (error) {
            this.logger.error('Transcription failed', error);
            throw error;
        }
    }
    async speak(text, voice = 'alloy') {
        if (!this.openaiApiKey) {
            throw new Error('OpenAI API key not configured for text-to-speech');
        }
        try {
            const response = await fetch('https://api.openai.com/v1/audio/speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.openaiApiKey}`,
                },
                body: JSON.stringify({
                    model: 'tts-1',
                    input: text,
                    voice: voice,
                    response_format: 'mp3',
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Text-to-speech failed');
            }
            const arrayBuffer = await response.arrayBuffer();
            const base64Audio = Buffer.from(arrayBuffer).toString('base64');
            const wordCount = text.split(/\s+/).length;
            const estimatedDuration = (wordCount / 150) * 60;
            return {
                audioBase64: base64Audio,
                format: 'mp3',
                duration: estimatedDuration,
            };
        }
        catch (error) {
            this.logger.error('Text-to-speech failed', error);
            throw error;
        }
    }
    getAvailableVoices() {
        return [
            {
                id: 'alloy',
                name: 'Alloy',
                description: 'Neutral and balanced voice',
            },
            {
                id: 'echo',
                name: 'Echo',
                description: 'Warm and conversational',
            },
            {
                id: 'fable',
                name: 'Fable',
                description: 'British accent, storytelling style',
            },
            {
                id: 'onyx',
                name: 'Onyx',
                description: 'Deep and authoritative',
            },
            {
                id: 'nova',
                name: 'Nova',
                description: 'Friendly and upbeat',
            },
            {
                id: 'shimmer',
                name: 'Shimmer',
                description: 'Clear and expressive',
            },
        ];
    }
};
exports.AIVoiceService = AIVoiceService;
exports.AIVoiceService = AIVoiceService = AIVoiceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AIVoiceService);
//# sourceMappingURL=ai-voice.service.js.map