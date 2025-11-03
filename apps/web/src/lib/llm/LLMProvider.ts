/**
 * Unified LLM Provider with 3-Tier Fallback Strategy
 * 
 * Priority Order:
 * 1. Gemini Nano (Android 14+ with AICore) - Best quality, multimodal
 * 2. Llama Local (Android 7+, any device) - Offline fallback, text-only
 * 3. Cloud API (optional, user-provided key) - Online fallback
 */

import { Capacitor } from '@capacitor/core';
import { geminiNano } from './GeminiNano';
import { llamaLocal } from './LlamaLocal';
import { streamChat } from '../api';
import { ChatMessage } from '@farm-visit/shared';

export interface LLMInput {
  text: string;
  location?: { lat: number; lon: number };
  images?: string[]; // For future vision support
}

export interface LLMProviderStats {
  provider: 'gemini-nano' | 'llama-local' | 'cloud-api' | 'none';
  fallbackReason?: string;
}

/**
 * Unified LLM Provider with automatic fallback
 */
export class LLMProvider {
  private stats: LLMProviderStats = { provider: 'none' };

  /**
   * Stream text completion with automatic fallback
   */
  async *stream(input: LLMInput): AsyncGenerator<string> {
    // Priority 1: Try Gemini Nano (best quality, multimodal)
    try {
      const available = await geminiNano.isAvailable();
      if (available) {
        console.log('[LLMProvider] Using Gemini Nano (Priority 1)');
        this.stats = { provider: 'gemini-nano' };
        
        yield* geminiNano.stream({
          text: input.text,
          location: input.location,
        });
        return;
      }
    } catch (err: any) {
      console.warn('[LLMProvider] Gemini Nano failed, trying fallback:', err.message);
      this.stats.fallbackReason = `Gemini Nano: ${err.message}`;
    }

    // Priority 2: Try Llama Local (offline fallback)
    try {
      const available = await llamaLocal.checkAvailability();
      if (available) {
        console.log('[LLMProvider] Using Llama Local (Priority 2 - Offline Fallback)');
        this.stats = { provider: 'llama-local' };
        
        yield* llamaLocal.stream({
          text: input.text,
          location: input.location,
        });
        return;
      }
    } catch (err: any) {
      console.warn('[LLMProvider] Llama Local failed, trying cloud fallback:', err.message);
      this.stats.fallbackReason = this.stats.fallbackReason 
        ? `${this.stats.fallbackReason}; Llama Local: ${err.message}`
        : `Llama Local: ${err.message}`;
    }

    // Priority 3: Cloud API (if online and configured)
    if (navigator.onLine) {
      try {
        console.log('[LLMProvider] Using Cloud API (Priority 3 - Online Fallback)');
        this.stats = { provider: 'cloud-api' };
        
        const messages: ChatMessage[] = [
          {
            role: 'user',
            content: input.text,
          },
        ];

        // Add location context to meta if available
        const meta = input.location
          ? {
              visit: {
                gps: {
                  lat: input.location.lat,
                  lon: input.location.lon,
                  acc: 0, // Accuracy not provided
                },
              },
            }
          : undefined;

        yield* streamChat(messages, meta);
        return;
      } catch (err: any) {
        console.error('[LLMProvider] Cloud API failed:', err);
        this.stats.fallbackReason = this.stats.fallbackReason 
          ? `${this.stats.fallbackReason}; Cloud API: ${err.message}`
          : `Cloud API: ${err.message}`;
      }
    } else {
      console.warn('[LLMProvider] Offline and no local models available');
      this.stats.fallbackReason = this.stats.fallbackReason 
        ? `${this.stats.fallbackReason}; Device is offline`
        : 'Device is offline';
    }

    // All providers failed
    this.stats = { provider: 'none' };
    throw new Error(
      `No LLM provider available. ${this.stats.fallbackReason || 'All providers failed'}. ` +
      `Please ensure you have either:\n` +
      `- Android 14+ with AICore (Gemini Nano)\n` +
      `- Llama Local model installed\n` +
      `- Internet connection and API key configured`
    );
  }

  /**
   * Get current provider statistics
   */
  getStats(): LLMProviderStats {
    return { ...this.stats };
  }

  /**
   * Check which providers are available (without initializing)
   */
  async checkAvailability(): Promise<{
    geminiNano: boolean;
    llamaLocal: boolean;
    cloudAvailable: boolean;
  }> {
    const results = {
      geminiNano: false,
      llamaLocal: false,
      cloudAvailable: navigator.onLine,
    };

    try {
      results.geminiNano = await geminiNano.isAvailable();
    } catch {
      // Ignore errors
    }

    try {
      results.llamaLocal = await llamaLocal.checkAvailability();
    } catch {
      // Ignore errors
    }

    return results;
  }
}

// Default instance
export const llmProvider = new LLMProvider();

