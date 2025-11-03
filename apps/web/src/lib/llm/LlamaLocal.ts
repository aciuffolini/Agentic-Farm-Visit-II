/**
 * Llama Local Integration - On-Device Offline Fallback
 * For devices without Gemini Nano support (Android 7+)
 * Text-only, fully offline
 */

import { Capacitor } from '@capacitor/core';
import LlamaLocalNative from './LlamaLocalNative';

export interface LlamaLocalInput {
  text: string;
  location?: { lat: number; lon: number };
}

export class LlamaLocal {
  private initialized: boolean = false;
  private available: boolean = false;
  private availabilityChecked: boolean = false;

  /**
   * Check if Llama Local is available on this device
   * Requires model to be downloaded/installed
   */
  async checkAvailability(): Promise<boolean> {
    if (this.availabilityChecked) {
      return this.available;
    }

    // Only available on Android
    if (!Capacitor.isNativePlatform()) {
      this.available = false;
      this.availabilityChecked = true;
      return false;
    }

    try {
      const result = await LlamaLocalNative.isAvailable();
      this.available = result.available || false;
      this.availabilityChecked = true;
      
      if (this.available) {
        console.log('[LlamaLocal] Available on device');
      } else {
        console.warn('[LlamaLocal] Not available:', result.reason || 'Model not installed');
      }
    } catch (err: any) {
      console.error('[LlamaLocal] Error checking availability:', err);
      this.available = false;
      this.availabilityChecked = true;
    }

    return this.available;
  }

  /**
   * Initialize Llama Local model
   * May download model if not present (requires internet first time)
   */
  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Llama Local only available on Android devices');
    }

    if (this.initialized) {
      return;
    }

    // Check availability first
    const available = await this.checkAvailability();
    if (!available) {
      throw new Error('Llama Local model not available. Please download the model first.');
    }

    try {
      const result = await LlamaLocalNative.loadModel();
      this.initialized = result.initialized;
      
      if (this.initialized) {
        console.log('[LlamaLocal] Initialized:', result.message);
      } else {
        throw new Error('Failed to initialize Llama Local');
      }
    } catch (err: any) {
      console.error('[LlamaLocal] Initialization failed:', err);
      throw err;
    }
  }

  /**
   * Stream completion (for chat)
   */
  async *stream(input: LlamaLocalInput): AsyncGenerator<string> {
    if (!this.available) {
      await this.checkAvailability();
      
      if (!this.available) {
        throw new Error('Llama Local not available on this device. Requires model to be installed.');
      }
    }

    if (!this.initialized) {
      await this.initialize();
    }

    if (!input.text) {
      throw new Error('Text input required');
    }

    // Check if input already contains a formatted prompt (from enhanced LLMProvider)
    // If it contains "User:" and "Assistant:" markers, use it directly
    // Otherwise, build prompt with context
    let prompt: string;
    if (input.text.includes('User:') && input.text.includes('Assistant:')) {
      // Enhanced prompt already formatted, use as-is
      prompt = input.text;
      console.log('[LlamaLocal] Using enhanced prompt from LLMProvider');
    } else {
      // Build prompt with context (legacy behavior)
      prompt = this.buildPrompt(input);
    }

    try {
      // Set up listener for stream chunks (similar to GeminiNano)
      const chunks: string[] = [];
      let streamComplete = false;
      let streamError: Error | null = null;
      let listenerHandle: any = null;

      // Create promise that resolves when stream is complete
      const streamCompletePromise = new Promise<void>((resolve, reject) => {
        listenerHandle = LlamaLocalNative.addListener('streamChunk', (data: any) => {
          try {
            if (data.done === true) {
              streamComplete = true;
              resolve();
            } else if (data.text !== undefined && data.text !== null) {
              chunks.push(data.text);
            }
          } catch (err: any) {
            streamError = err;
            streamComplete = true;
            reject(err);
          }
        });
      });

      // Start streaming
      LlamaLocalNative.stream({ prompt }).catch((err: any) => {
        console.error('[LlamaLocal] Stream start error:', err);
        streamError = err;
        streamComplete = true;
      });

      // Yield chunks as they arrive
      const maxWaitTime = 60000; // 60 seconds timeout (Llama is slower)
      const startTime = Date.now();

      while (!streamComplete || chunks.length > 0) {
        // Check timeout
        if (Date.now() - startTime > maxWaitTime) {
          console.warn('[LlamaLocal] Stream timeout after 60s');
          break;
        }

        // Check for error
        if (streamError) {
          throw streamError;
        }

        // Yield available chunks
        while (chunks.length > 0) {
          const chunk = chunks.shift();
          if (chunk) {
            yield chunk;
          }
        }

        // Small delay to avoid busy-waiting
        await new Promise(resolve => setTimeout(resolve, 50));

        // Check if stream promise resolved
        try {
          await Promise.race([
            streamCompletePromise,
            new Promise(resolve => setTimeout(resolve, 0))
          ]);
        } catch (err) {
          // Stream promise rejected, error already set
        }
      }

      // Cleanup listener
      if (listenerHandle && typeof listenerHandle.remove === 'function') {
        try {
          listenerHandle.remove();
        } catch (err) {
          console.warn('[LlamaLocal] Error removing listener:', err);
        }
      }

      // Final yield of any remaining chunks
      while (chunks.length > 0) {
        const chunk = chunks.shift();
        if (chunk) {
          yield chunk;
        }
      }

    } catch (err: any) {
      console.error('[LlamaLocal] Streaming failed:', err);
      throw new Error(`Llama Local streaming failed: ${err.message}`);
    }
  }

  /**
   * Build prompt with context
   */
  private buildPrompt(input: LlamaLocalInput): string {
    const systemPrompt = `You are a helpful agricultural assistant for field visits. Help farmers with crop management, pest/disease identification, and field visit data extraction. Provide concise, practical advice in both English and Spanish when appropriate.`;

    let userPrompt = input.text || '';

    // Add location context if available
    if (input.location) {
      userPrompt += `\n\nLocation: ${input.location.lat.toFixed(6)}, ${input.location.lon.toFixed(6)}`;
    }

    return `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`;
  }

  /**
   * Check if Llama Local is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.availabilityChecked) {
      await this.checkAvailability();
    }
    return this.available;
  }
}

// Default instance
export const llamaLocal = new LlamaLocal();

