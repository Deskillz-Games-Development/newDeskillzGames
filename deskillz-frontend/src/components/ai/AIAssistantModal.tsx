import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Bot,
  User,
  Sparkles,
  X,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  feedbackGiven?: 'helpful' | 'not_helpful';
  suggestedFollowUps?: string[];
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewMessage?: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onNewMessage,
}) => {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle scroll button visibility
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "👋 Hi! I'm your Deskillz AI assistant. I can help you with:\n\n• Joining tournaments & understanding prizes\n• Wallet setup & crypto payments\n• Game integration (for developers)\n• Troubleshooting issues\n\nHow can I help you today?",
          timestamp: new Date(),
          suggestedFollowUps: [
            'How do I join a tournament?',
            'Which cryptocurrencies are supported?',
            'How do I integrate my game?',
          ],
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Send message to AI
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add loading message
    const loadingId = `loading-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
      },
    ]);

    try {
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          conversationId,
          currentPage: location.pathname,
          sessionId: localStorage.getItem('ai-session-id') || undefined,
        }),
      });

      const data = await response.json();

      // Save session and conversation IDs
      if (!localStorage.getItem('ai-session-id')) {
        localStorage.setItem('ai-session-id', data.conversationId);
      }
      setConversationId(data.conversationId);

      // Replace loading message with actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                id: data.messageId || `assistant-${Date.now()}`,
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
                suggestedFollowUps: data.suggestedFollowUps,
              }
            : msg
        )
      );

      // Auto-speak if enabled
      if (autoSpeak) {
        speakText(data.response);
      }

      onNewMessage?.();
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date(),
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Microphone access denied. Please enable microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Transcribe audio
  const transcribeAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        const response = await fetch(`${API_BASE}/ai/transcribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audioData: base64Audio,
            format: 'webm',
          }),
        });

        const data = await response.json();
        if (data.text) {
          setInputValue(data.text);
          // Auto-send transcribed message
          sendMessage(data.text);
        }
      };
    } catch (error) {
      console.error('Transcription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Text to speech
  const speakText = async (text: string) => {
    if (isSpeaking) return;

    setIsSpeaking(true);
    try {
      const response = await fetch(`${API_BASE}/ai/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice: 'nova' }),
      });

      const data = await response.json();
      if (data.audioData) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioData}`);
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  };

  // Submit feedback
  const submitFeedback = async (messageId: string, rating: 'helpful' | 'not_helpful') => {
    try {
      await fetch(`${API_BASE}/ai/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          messageId,
          rating: rating === 'helpful' ? 'HELPFUL' : 'NOT_HELPFUL',
        }),
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, feedbackGiven: rating } : msg
        )
      );
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // Reset conversation
  const resetConversation = () => {
    setMessages([]);
    setConversationId(null);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-24 right-6 z-50 w-96 h-[32rem] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-cyan-900/30 to-purple-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Deskillz AI</h3>
            <p className="text-xs text-gray-400">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`p-2 rounded-lg transition-colors ${
              autoSpeak ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'
            }`}
            title={autoSpeak ? 'Disable auto-speak' : 'Enable auto-speak'}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={resetConversation}
            className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
            title="New conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-purple-600'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-600'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Sparkles className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Message Content */}
            <div
              className={`flex-1 max-w-[80%] ${
                message.role === 'user' ? 'text-right' : ''
              }`}
            >
              <div
                className={`inline-block p-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-md'
                    : 'bg-gray-800 text-gray-100 rounded-bl-md'
                }`}
              >
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
              </div>

              {/* Suggested Follow-ups */}
              {message.role === 'assistant' &&
                message.suggestedFollowUps &&
                message.suggestedFollowUps.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.suggestedFollowUps.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(suggestion)}
                        className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-full transition-colors border border-gray-700"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

              {/* Feedback Buttons */}
              {message.role === 'assistant' &&
                !message.isLoading &&
                message.id !== 'welcome' && (
                  <div className="mt-2 flex items-center gap-2">
                    {!message.feedbackGiven ? (
                      <>
                        <button
                          onClick={() => submitFeedback(message.id, 'helpful')}
                          className="p-1.5 text-gray-500 hover:text-green-400 transition-colors"
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => submitFeedback(message.id, 'not_helpful')}
                          className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                          title="Not helpful"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => speakText(message.content)}
                          className="p-1.5 text-gray-500 hover:text-cyan-400 transition-colors"
                          title="Read aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">
                        {message.feedbackGiven === 'helpful'
                          ? '✓ Thanks for the feedback!'
                          : '✓ We\'ll improve this'}
                      </span>
                    )}
                  </div>
                )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 left-1/2 transform -translate-x-1/2 p-2 bg-gray-800 rounded-full shadow-lg border border-gray-700 hover:bg-gray-700 transition-colors"
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
        <div className="flex items-end gap-2">
          {/* Voice Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-xl transition-all ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
            }`}
            title={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            {isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:border-cyan-500 transition-colors"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className={`p-3 rounded-xl transition-all ${
              inputValue.trim() && !isLoading
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:opacity-90'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <p className="mt-2 text-xs text-red-400 text-center animate-pulse">
            🎤 Recording... Click the mic button to stop
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default AIAssistantModal;
