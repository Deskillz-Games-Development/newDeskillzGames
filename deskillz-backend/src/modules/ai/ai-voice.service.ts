import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIVoiceTranscribeResponseDto,
  AIVoiceSpeakResponseDto,
  AIVoiceOptionDto,
} from './dto/ai.dto';

@Injectable()
export class AIVoiceService {
  private readonly logger = new Logger(AIVoiceService.name);
  private readonly openaiApiKey: string | undefined;

  constructor(private configService: ConfigService) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
  }

  async transcribe(
    audioBase64: string,
    language?: string,
  ): Promise<AIVoiceTranscribeResponseDto> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured for voice transcription');
    }

    try {
      // Convert base64 to buffer
      const audioBuffer = Buffer.from(audioBase64, 'base64');

      // Create form data
      const formData = new FormData();
      formData.append('file', new Blob([audioBuffer]), 'audio.webm');
      formData.append('model', 'whisper-1');
      if (language) {
        formData.append('language', language);
      }

      const response = await fetch(
        'https://api.openai.com/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Transcription failed');
      }

      return {
        text: data.text,
        language: language || 'en',
        confidence: 0.95, // Whisper doesn't return confidence, estimate high
      };
    } catch (error) {
      this.logger.error('Transcription failed', error);
      throw error;
    }
  }

  async speak(
    text: string,
    voice = 'alloy',
  ): Promise<AIVoiceSpeakResponseDto> {
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

      // Estimate duration (roughly 150 words per minute, average word = 5 chars)
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = (wordCount / 150) * 60;

      return {
        audioBase64: base64Audio,
        format: 'mp3',
        duration: estimatedDuration,
      };
    } catch (error) {
      this.logger.error('Text-to-speech failed', error);
      throw error;
    }
  }

  getAvailableVoices(): AIVoiceOptionDto[] {
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
}
