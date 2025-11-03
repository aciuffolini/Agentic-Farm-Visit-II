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
  model?: ModelOption; // User-selected model ('nano', 'gpt-4o-mini', 'llama-small', or 'auto' for fallback)
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

export type ModelOption = 'nano' | 'gpt-4o-mini' | 'llama-small' | 'auto';

export interface LLMProviderStats {
  provider: 'gemini-nano' | 'llama-local' | 'cloud-api' | 'none';
  fallbackReason?: string;
  model?: ModelOption;
}

/**
 * Unified LLM Provider with automatic fallback
 */
export class LLMProvider {
  private stats: LLMProviderStats = { provider: 'none' };

  /**
   * Build enhanced system prompt with structured visit context
   */
  private buildEnhancedSystemPrompt(visitContext?: LLMInput['visitContext']): string {
    let systemPrompt = `You are an expert agricultural field visit assistant. Your role is to help farmers and agricultural professionals with:

**Core Responsibilities:**
• Field visit data capture and organization
• Crop identification and management advice
• Pest and disease detection and treatment recommendations
• Agricultural best practices and field management
• GPS location-based agricultural insights
• Photo and audio analysis from field visits

**Communication Style:**
• Be concise, practical, and provide actionable advice
• Use the visit context provided (GPS location, notes, photos, audio recordings, saved visit records) to give specific, relevant responses
• Respond in a friendly, professional manner suitable for field work
• If context is available, reference it explicitly in your responses

**Response Guidelines:**
• When photos or audio are mentioned, acknowledge their presence and provide insights if possible
• For location-based questions, use GPS coordinates to provide region-specific advice
• Reference previous visit records when relevant for continuity`;

    // Add structured visit context to system prompt if available
    if (visitContext) {
      let contextInfo = '\n\n**=== CURRENT VISIT CONTEXT ===**\n';
      
      if (visitContext.current) {
        const ctx = visitContext.current;
        if (ctx.gps) {
          contextInfo += `\n📍 **GPS Location:**\n`;
          contextInfo += `   - Latitude: ${ctx.gps.lat.toFixed(6)}\n`;
          contextInfo += `   - Longitude: ${ctx.gps.lon.toFixed(6)}\n`;
          contextInfo += `   - Accuracy: ${ctx.gps.accuracy?.toFixed(0) || 'N/A'} meters\n`;
        }
        if (ctx.note) {
          contextInfo += `\n📝 **Current Note:**\n   "${ctx.note}"\n`;
        }
        if (ctx.photo) {
          contextInfo += `\n📷 **Photo Available:** Yes (captured during this visit)\n`;
          contextInfo += `   - Format: Base64 data URL\n`;
          contextInfo += `   - Use this to help with visual analysis questions\n`;
        }
        if (ctx.audio) {
          contextInfo += `\n🎤 **Audio Recording Available:** Yes (captured during this visit)\n`;
          contextInfo += `   - Format: Base64 data URL\n`;
          contextInfo += `   - Use this to help with voice note analysis\n`;
        }
        if (!ctx.gps && !ctx.note && !ctx.photo && !ctx.audio) {
          contextInfo += `   (No current visit data captured yet)\n`;
        }
      }
      
      if (visitContext.latest) {
        const latest = visitContext.latest;
        contextInfo += '\n\n**=== LATEST SAVED VISIT RECORD ===**\n';
        if (latest.id) contextInfo += `\n🆔 **Visit ID:** ${latest.id}\n`;
        if (latest.field_id) contextInfo += `\n🌾 **Field ID:** ${latest.field_id}\n`;
        if (latest.crop) contextInfo += `\n🌽 **Crop:** ${latest.crop}\n`;
        if (latest.issue) contextInfo += `\n⚠️ **Issue Identified:** ${latest.issue}\n`;
        if (latest.severity) contextInfo += `\n📊 **Severity:** ${latest.severity}/5\n`;
        if (latest.photo_url) {
          contextInfo += `\n📷 **Photo:** Available (saved in database)\n`;
          contextInfo += `   - Reference this photo for visual analysis\n`;
        }
        if (latest.audio_url) {
          contextInfo += `\n🎤 **Audio Recording:** Available (saved in database)\n`;
          contextInfo += `   - Reference this audio for voice note analysis\n`;
        }
      }
      
      systemPrompt += contextInfo;
    }

    return systemPrompt;
  }

  /**
   * Stream text completion with automatic fallback or explicit model selection
   * Priority: Offline-first (Nano/Llama) → Cloud API (online only)
   * Or use explicit model selection if provided
   */
  async *stream(input: LLMInput): AsyncGenerator<string> {
    const selectedModel = input.model || 'auto';
    
    // If explicit model selected, use it (with fallback if unavailable)
    if (selectedModel === 'nano') {
      // Try Gemini Nano first
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          const available = await geminiNano.isAvailable();
          if (available) {
            console.log('[LLMProvider] Using Gemini Nano (User Selected)');
            this.stats = { provider: 'gemini-nano', model: 'nano' };
            
            // Build enhanced prompt for Nano
            const enhancedPrompt = this.buildEnhancedSystemPrompt(input.visitContext);
            const fullPrompt = `${enhancedPrompt}\n\nUser: ${input.text}\n\nAssistant:`;
            
            yield* geminiNano.stream({
              text: fullPrompt,
              location: input.location,
            });
            return;
          }
        }
        throw new Error('Gemini Nano not available (requires Android 14+ with AICore)');
      } catch (err: any) {
        console.warn('[LLMProvider] Gemini Nano failed:', err.message);
        throw new Error(`Gemini Nano unavailable: ${err.message}`);
      }
    }
    
    if (selectedModel === 'llama-small') {
      // Try Llama Local
      try {
        const available = await llamaLocal.checkAvailability();
        if (available) {
          console.log('[LLMProvider] Using Llama Local (User Selected)');
          this.stats = { provider: 'llama-local', model: 'llama-small' };
          
          // Build enhanced prompt for Llama
          const enhancedPrompt = this.buildEnhancedSystemPrompt(input.visitContext);
          const fullPrompt = `${enhancedPrompt}\n\nUser: ${input.text}\n\nAssistant:`;
          
          yield* llamaLocal.stream({
            text: fullPrompt,
            location: input.location,
          });
          return;
        }
        throw new Error('Llama Local not available (model not installed)');
      } catch (err: any) {
        console.warn('[LLMProvider] Llama Local failed:', err.message);
        throw new Error(`Llama Local unavailable: ${err.message}`);
      }
    }
    
    if (selectedModel === 'gpt-4o-mini') {
      // Try Cloud API (requires online and API key)
      if (!navigator.onLine) {
        throw new Error('ChatGPT 4o mini requires internet connection');
      }
      
      const { getUserApiKey } = await import('../config/userKey');
      const hasKey = getUserApiKey();
      
      if (!hasKey) {
        throw new Error('ChatGPT 4o mini requires API key. Please set it using the 🔑 button.');
      }
      
      try {
        console.log('[LLMProvider] Using ChatGPT 4o mini (User Selected)');
        this.stats = { provider: 'cloud-api', model: 'gpt-4o-mini' };
        
        const systemPrompt = this.buildEnhancedSystemPrompt(input.visitContext);
        
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

        const meta = input.location
          ? {
              visit: {
                gps: {
                  lat: input.location.lat,
                  lon: input.location.lon,
                  acc: 0,
                },
              },
            }
          : undefined;

        yield* streamChat(messages, meta);
        return;
      } catch (err: any) {
        console.error('[LLMProvider] ChatGPT 4o mini failed:', err);
        throw new Error(`ChatGPT 4o mini error: ${err.message}`);
      }
    }
    
    // Auto mode: Try fallback order (original behavior)
    // Priority 1: Try Gemini Nano (offline, best quality, multimodal)
    // Only on native Android
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const available = await geminiNano.isAvailable();
        if (available) {
          console.log('[LLMProvider] Using Gemini Nano (Priority 1 - Offline)');
          this.stats = { provider: 'gemini-nano', model: 'auto' };
          
          // Build enhanced prompt
          const enhancedPrompt = this.buildEnhancedSystemPrompt(input.visitContext);
          const fullPrompt = `${enhancedPrompt}\n\nUser: ${input.text}\n\nAssistant:`;
          
          yield* geminiNano.stream({
            text: fullPrompt,
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
        this.stats = { provider: 'llama-local', model: 'auto' };
        
        // Build enhanced prompt
        const enhancedPrompt = this.buildEnhancedSystemPrompt(input.visitContext);
        const fullPrompt = `${enhancedPrompt}\n\nUser: ${input.text}\n\nAssistant:`;
        
        yield* llamaLocal.stream({
          text: fullPrompt,
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
          this.stats = { provider: 'cloud-api', model: 'auto' };
          
          // Use enhanced system prompt
          const systemPrompt = this.buildEnhancedSystemPrompt(input.visitContext);

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

