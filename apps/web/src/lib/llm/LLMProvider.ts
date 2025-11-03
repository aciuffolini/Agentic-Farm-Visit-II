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
  visitContext?: {
    current?: {
      gps?: { lat: number; lon: number; accuracy?: number } | null;
      note?: string | null;
      photo?: string | null;
      audio?: string | null;
    };
    latest?: {
      id?: string;
      field_id?: string;
      crop?: string;
      issue?: string;
      severity?: number;
      photo_url?: string;
      audio_url?: string;
    } | null;
  } | null;
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
   * Priority: Offline-first (Nano/Llama) → Cloud API (online only)
   */
  async *stream(input: LLMInput): AsyncGenerator<string> {
    // Priority 1: Try Gemini Nano (offline, best quality, multimodal)
    // Only on native Android
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const available = await geminiNano.isAvailable();
        if (available) {
          console.log('[LLMProvider] Using Gemini Nano (Priority 1 - Offline)');
          this.stats = { provider: 'gemini-nano' };
          
          yield* geminiNano.stream({
            text: input.text,
            location: input.location,
          });
          return;
        }
      }
    } catch (err: any) {
      console.warn('[LLMProvider] Gemini Nano failed, trying fallback:', err.message);
      this.stats.fallbackReason = `Gemini Nano: ${err.message}`;
    }

    // Priority 2: Try Llama Local (offline fallback, small model for Q&A)
    try {
      const available = await llamaLocal.checkAvailability();
      if (available) {
        console.log('[LLMProvider] Using Llama Local (Priority 2 - Offline Q&A)');
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

    // Priority 3: Cloud API (only if online AND has API key)
    if (navigator.onLine) {
      // Check if API key is available first
      const { getUserApiKey } = await import('../config/userKey');
      const hasKey = getUserApiKey();
      
      // Only try Cloud API if:
      // 1. User has provided API key, OR
      // 2. Server might have default key (we'll try anyway, server will reject if needed)
      // But if we have no key and local models failed, we should inform user clearly
      
      if (!hasKey) {
        console.warn('[LLMProvider] No API key found. Skipping Cloud API. Server may have default key, but will try local models first.');
        // Don't try Cloud API without key - local models should be preferred anyway
        this.stats.fallbackReason = this.stats.fallbackReason 
          ? `${this.stats.fallbackReason}; Cloud API skipped (no API key provided)`
          : 'Cloud API skipped (no API key provided)';
      } else {
        // User has API key - try Cloud API
        try {
          console.log('[LLMProvider] Using Cloud API (Priority 3 - Online Fallback)');
          this.stats = { provider: 'cloud-api' };
          
          // Build system prompt with structured visit context
          let systemPrompt = `You are a helpful agricultural field visit assistant. You help farmers and agricultural professionals with:

• Field visit data capture and organization
• Crop identification and management advice
• Pest and disease detection and treatment recommendations
• Agricultural best practices and field management
• GPS location-based agricultural insights

Be concise, practical, and provide actionable advice. Use the visit context provided to give specific, relevant responses.

Respond in a friendly, professional manner suitable for field work.`;

          // Add structured visit context to system prompt if available
          if (input.visitContext) {
            const ctx = input.visitContext;
            let contextInfo = '\n\n**Current Visit Context:**\n';
            
            if (ctx.current) {
              if (ctx.current.gps) {
                contextInfo += `- Location: ${ctx.current.gps.lat.toFixed(6)}, ${ctx.current.gps.lon.toFixed(6)} (accuracy: ${ctx.current.gps.accuracy}m)\n`;
              }
              if (ctx.current.note) {
                contextInfo += `- Note: ${ctx.current.note}\n`;
              }
              if (ctx.current.photo) {
                contextInfo += `- Photo: Available (data URL)\n`;
              }
              if (ctx.current.audio) {
                contextInfo += `- Audio Recording: Available (data URL)\n`;
              }
            }
            
            if (ctx.latest) {
              contextInfo += '\n**Latest Saved Visit:**\n';
              if (ctx.latest.field_id) contextInfo += `- Field ID: ${ctx.latest.field_id}\n`;
              if (ctx.latest.crop) contextInfo += `- Crop: ${ctx.latest.crop}\n`;
              if (ctx.latest.issue) contextInfo += `- Issue: ${ctx.latest.issue}\n`;
              if (ctx.latest.severity) contextInfo += `- Severity: ${ctx.latest.severity}/5\n`;
              if (ctx.latest.photo_url) contextInfo += `- Photo: Available (saved in database)\n`;
              if (ctx.latest.audio_url) contextInfo += `- Audio: Available (saved in database)\n`;
            }
            
            systemPrompt += contextInfo;
          }

          // Build user message with location if available
          let userContent = input.text;
          if (input.location) {
            userContent += `\n\nLocation: ${input.location.lat.toFixed(6)}, ${input.location.lon.toFixed(6)}`;
          }

          const messages: ChatMessage[] = [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userContent,
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
      }
    } else {
      console.warn('[LLMProvider] Offline and no local models available');
      this.stats.fallbackReason = this.stats.fallbackReason 
        ? `${this.stats.fallbackReason}; Device is offline`
        : 'Device is offline';
    }

    // All providers failed
    this.stats = { provider: 'none' };
    
    // Get API key status for better error message
    const { getUserApiKey } = await import('../config/userKey');
    const hasKey = getUserApiKey();
    
    let errorMsg = `No LLM provider available. ${this.stats.fallbackReason || 'All providers failed'}.\n\n`;
    errorMsg += `**Tried (in order):**\n`;
    errorMsg += `1. Gemini Nano (Android 14+ with AICore) - ❌ Not available\n`;
    errorMsg += `2. Llama Local (Android 7+) - ❌ Not available\n`;
    
    if (navigator.onLine) {
      if (hasKey) {
        errorMsg += `3. Cloud API - ❌ Failed\n`;
      } else {
        errorMsg += `3. Cloud API - ⏭️ Skipped (no API key provided)\n`;
        errorMsg += `\n💡 **Solution:** Set API key using 🔑 button to enable Cloud API fallback.`;
      }
    } else {
      errorMsg += `3. Cloud API - ⏭️ Skipped (device offline)\n`;
    }
    
    errorMsg += `\n**To fix:** Install Gemini Nano (Android 14+) or Llama Local model, or set API key for Cloud API.`;
    
    throw new Error(errorMsg);
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

