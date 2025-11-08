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
  images?: string[]; // Base64 data URLs for images (photo_data)
  audio?: string; // Base64 data URL for audio (audio_data)
  model?: ModelOption; // User-selected model ('nano', 'gpt-4o-mini', 'llama-small', 'claude-code', or 'auto' for fallback)
  visitContext?: {
    current?: {
      gps?: { lat: number; lon: number; accuracy?: number } | null;
      note?: string | null;
      photo?: string | null; // Base64 data URL
      audio?: string | null; // Base64 data URL
    };
    kmzData?: {
      placemarks: Array<{
        name: string;
        type: "polygon" | "line" | "point";
        coordinates: Array<{ lat: number; lon: number; alt?: number }>;
      }>;
      bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
      };
    } | null;
    latest?: {
      id?: string;
      field_id?: string;
      crop?: string;
      issue?: string;
      severity?: number;
      photo_data?: string; // Base64 data URL from database
      audio_data?: string; // Base64 data URL from database
    } | null;
    allVisits?: Array<{
      id?: string;
      field_id?: string;
      crop?: string;
      issue?: string;
      severity?: number;
      note?: string;
      ts?: number;
      lat?: number;
      lon?: number;
      acc?: number;
      photo_data?: string; // Base64 data URL from database
      audio_data?: string; // Base64 data URL from database
    }>; // Full table of all saved visits
  } | null;
}

export type ModelOption = 'nano' | 'gpt-4o-mini' | 'llama-small' | 'claude-code' | 'auto';

export interface LLMProviderStats {
  provider: 'gemini-nano' | 'llama-local' | 'cloud-api' | 'claude-api' | 'none';
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
• **MULTIMODAL ANALYSIS**: Photo analysis + Map data + GPS location for comprehensive field insights

**Communication Style:**
• Be concise, practical, and provide actionable advice
• **ALWAYS analyze photos when provided** - they contain critical visual information about the field
• Combine photo analysis with map data (field boundaries, field names) and GPS location
• Use the visit context provided (GPS location, notes, photos, audio recordings, saved visit records, farm map) to give specific, relevant responses
• Respond in a friendly, professional manner suitable for field work
• If context is available, reference it explicitly in your responses

**Response Guidelines:**
• **WHEN A PHOTO IS PROVIDED**: 
  - **ALWAYS analyze the photo in detail** - describe what you see (crops, plants, soil, pests, diseases, field conditions)
  - **Combine with map data**: Identify which field you're in based on GPS, then reference that field name when analyzing the photo
  - **Example**: "Based on your GPS location and the farm map, you are in [Field Name]. In the photo I can see [detailed analysis]..."
• **When photos or audio are mentioned, acknowledge their presence and provide insights if possible**
• **For location-based questions**: Use GPS coordinates + map data to identify the field, then provide region-specific advice
• **Reference previous visit records** when relevant for continuity
• **Use map data to identify field boundaries** and correlate GPS location with field names`;

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
          contextInfo += `   - **IMAGE DATA INCLUDED IN THIS REQUEST** - Analyze this photo in detail\n`;
          contextInfo += `   - **IMPORTANT**: This photo shows the field/area being visited\n`;
          contextInfo += `   - Combine photo analysis with map data (field boundaries) and GPS location to provide specific field insights\n`;
          contextInfo += `   - Identify crops, issues, pests, diseases, or field conditions visible in the photo\n`;
          contextInfo += `   - Reference the field name from the map if GPS location matches a field boundary\n`;
        }
        if (ctx.audio) {
          contextInfo += `\n🎤 **Audio Recording Available:** Yes (captured during this visit)\n`;
          contextInfo += `   - Format: Base64 data URL\n`;
          contextInfo += `   - Audio data included in request for transcription/analysis\n`;
        }
        if (!ctx.gps && !ctx.note && !ctx.photo && !ctx.audio) {
          contextInfo += `   (No current visit data captured yet)\n`;
        }
      }
      
      // Add KMZ/KML farm map data if available
      if (visitContext.kmzData) {
        const kmz = visitContext.kmzData;
        contextInfo += '\n\n**=== FARM MAP (KMZ/KML) ===**\n';
        contextInfo += `\n🗺️ **Farm Boundaries & Fields:**\n`;
        contextInfo += `   - Total placemarks: ${kmz.placemarks.length}\n`;
        contextInfo += `   - Map bounds: ${kmz.bounds.south.toFixed(4)}°S to ${kmz.bounds.north.toFixed(4)}°N, ${kmz.bounds.west.toFixed(4)}°W to ${kmz.bounds.east.toFixed(4)}°E\n`;
        
        if (kmz.placemarks.length > 0) {
          contextInfo += `\n   **Fields/Regions:**\n`;
          kmz.placemarks.forEach((placemark, idx) => {
            contextInfo += `   ${idx + 1}. **${placemark.name}** (${placemark.type})\n`;
            if (placemark.coordinates.length > 0) {
              const firstCoord = placemark.coordinates[0];
              contextInfo += `      - First point: ${firstCoord.lat.toFixed(6)}, ${firstCoord.lon.toFixed(6)}\n`;
              contextInfo += `      - Total points: ${placemark.coordinates.length}\n`;
            }
          });
        }
        contextInfo += `\n   **IMPORTANT - Combine Map with Photo Analysis:**\n`;
        contextInfo += `   - Use GPS coordinates to identify which field/region the current location is in\n`;
        contextInfo += `   - When a photo is provided, analyze it in the context of the identified field\n`;
        contextInfo += `   - Reference the field name (from map) when describing what you see in the photo\n`;
        contextInfo += `   - Example: "Based on the photo and GPS location, you are in [Field Name] and I can see..."\n`;
      }
      
      // Include full visit history (all saved visits in table)
      if (visitContext.allVisits && visitContext.allVisits.length > 0) {
        contextInfo += '\n\n**=== FULL VISIT HISTORY (ALL SAVED VISITS) ===**\n';
        contextInfo += `\n📊 **Total Saved Visits:** ${visitContext.allVisits.length}\n`;
        contextInfo += `\n**Visit Records (most recent first):**\n`;
        
        visitContext.allVisits.forEach((visit, idx) => {
          contextInfo += `\n--- **Visit #${idx + 1}** (ID: ${visit.id || 'N/A'}) ---\n`;
          if (visit.ts) {
            const visitDate = new Date(visit.ts);
            contextInfo += `📅 **Date:** ${visitDate.toLocaleString()}\n`;
          }
          if (visit.field_id) contextInfo += `🌾 **Field ID:** ${visit.field_id}\n`;
          if (visit.crop) contextInfo += `🌽 **Crop:** ${visit.crop}\n`;
          if (visit.issue) contextInfo += `⚠️ **Issue:** ${visit.issue}\n`;
          if (visit.severity) contextInfo += `📊 **Severity:** ${visit.severity}/5\n`;
          if (visit.note) contextInfo += `📝 **Note:** "${visit.note}"\n`;
          if (visit.lat && visit.lon) {
            contextInfo += `📍 **Location:** ${visit.lat.toFixed(6)}, ${visit.lon.toFixed(6)}\n`;
          }
          if (visit.photo_data) {
            contextInfo += `📷 **Photo:** Available (saved in database)\n`;
            contextInfo += `   - **IMAGE DATA INCLUDED IN THIS REQUEST** - Can analyze this photo\n`;
          }
          if (visit.audio_data) {
            contextInfo += `🎤 **Audio:** Available (saved in database)\n`;
          }
        });
        
        contextInfo += `\n**Use this history to:**\n`;
        contextInfo += `- Track changes over time for the same field\n`;
        contextInfo += `- Compare multiple visits to identify patterns\n`;
        contextInfo += `- Provide context about visit frequency and trends\n`;
        contextInfo += `- Reference previous issues or treatments\n`;
        contextInfo += `- Analyze progression of crop conditions\n`;
      }
      
      // Also include latest visit summary for quick reference
      if (visitContext.latest) {
        const latest = visitContext.latest;
        contextInfo += '\n\n**=== LATEST SAVED VISIT (MOST RECENT) ===**\n';
        if (latest.id) contextInfo += `\n🆔 **Visit ID:** ${latest.id}\n`;
        if (latest.field_id) contextInfo += `\n🌾 **Field ID:** ${latest.field_id}\n`;
        if (latest.crop) contextInfo += `\n🌽 **Crop:** ${latest.crop}\n`;
        if (latest.issue) contextInfo += `\n⚠️ **Issue Identified:** ${latest.issue}\n`;
        if (latest.severity) contextInfo += `\n📊 **Severity:** ${latest.severity}/5\n`;
        if (latest.photo_data) {
          contextInfo += `\n📷 **Photo:** Available (saved in database from previous visit)\n`;
          contextInfo += `   - **IMAGE DATA INCLUDED IN THIS REQUEST** - Analyze this photo in detail\n`;
          contextInfo += `   - This photo is from a previously saved visit to field: ${latest.field_id || 'unknown'}\n`;
          contextInfo += `   - Compare with current visit photo if both are available\n`;
          contextInfo += `   - Use for continuity and tracking changes over time\n`;
        }
        if (latest.audio_data) {
          contextInfo += `\n🎤 **Audio Recording:** Available (saved in database)\n`;
          contextInfo += `   - Audio data included in request for transcription/analysis\n`;
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
            
            // Extract image data from visit context (current photo + all saved visit photos)
            const images: string[] = [];
            if (input.visitContext?.current?.photo) {
              images.push(input.visitContext.current.photo);
              console.log('[LLMProvider] Current photo found, length:', input.visitContext.current.photo.length);
            }
            // Add photos from all saved visits (prioritize most recent)
            if (input.visitContext?.allVisits) {
              for (const visit of input.visitContext.allVisits) {
                if (visit.photo_data && !images.includes(visit.photo_data)) {
                  images.push(visit.photo_data);
                  console.log('[LLMProvider] Saved visit photo found, length:', visit.photo_data.length);
                }
              }
            }
            // Fallback to latest if allVisits not available
            if (images.length === 0 && input.visitContext?.latest?.photo_data) {
              images.push(input.visitContext.latest.photo_data);
              console.log('[LLMProvider] Latest saved photo found (fallback), length:', input.visitContext.latest.photo_data.length);
            }
            
            console.log('[LLMProvider] Total images to send to Gemini Nano:', images.length);
            if (images.length > 0) {
              console.log('[LLMProvider] Image preview (first 100 chars):', images[0].substring(0, 100));
            }
            
            yield* geminiNano.stream({
              text: fullPrompt,
              location: input.location,
              image: images.length > 0 ? images[0] : undefined, // Gemini Nano supports single image
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
          // Note: Llama Local doesn't support images/audio yet, but we include context in prompt
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
      console.log('[LLMProvider] GPT-4o mini selected, checking requirements...');
      
      if (!navigator.onLine) {
        console.warn('[LLMProvider] Device is offline');
        throw new Error('ChatGPT 4o mini requires internet connection');
      }
      
      const { getUserApiKey } = await import('../config/userKey');
      const hasKey = getUserApiKey();
      
      console.log('[LLMProvider] API key check:', hasKey ? 'Found' : 'Not found');
      
      if (!hasKey) {
        throw new Error('ChatGPT 4o mini requires API key. Please set it using the 🔑 button.');
      }
      
      try {
        console.log('[LLMProvider] Using ChatGPT 4o mini (User Selected)');
        this.stats = { provider: 'cloud-api', model: 'gpt-4o-mini' };
        
        const systemPrompt = this.buildEnhancedSystemPrompt(input.visitContext);
        console.log('[LLMProvider] Enhanced system prompt length:', systemPrompt.length);
        
        let userContent = input.text;
        if (input.location) {
          userContent += `\n\nLocation: ${input.location.lat.toFixed(6)}, ${input.location.lon.toFixed(6)}`;
        }

        // Extract image data from visit context for GPT-4o mini vision
        // OpenAI GPT-4o vision requires images in content array format
        // Include current photo + all saved visit photos (prioritize most recent)
        const imageDataUrls: string[] = [];
        if (input.visitContext?.current?.photo) {
          imageDataUrls.push(input.visitContext.current.photo);
          console.log('[LLMProvider] Current photo found for GPT-4o mini, length:', input.visitContext.current.photo.length);
        }
        // Add photos from all saved visits
        if (input.visitContext?.allVisits) {
          for (const visit of input.visitContext.allVisits) {
            if (visit.photo_data && !imageDataUrls.includes(visit.photo_data)) {
              imageDataUrls.push(visit.photo_data);
              console.log('[LLMProvider] Saved visit photo found for GPT-4o mini, length:', visit.photo_data.length);
            }
          }
        }
        // Fallback to latest if allVisits not available
        if (imageDataUrls.length === 0 && input.visitContext?.latest?.photo_data) {
          imageDataUrls.push(input.visitContext.latest.photo_data);
          console.log('[LLMProvider] Latest saved photo found for GPT-4o mini (fallback), length:', input.visitContext.latest.photo_data.length);
        }

        console.log('[LLMProvider] Total images to send to GPT-4o mini:', imageDataUrls.length);
        if (imageDataUrls.length > 0) {
          console.log('[LLMProvider] Image preview (first 100 chars):', imageDataUrls[0].substring(0, 100));
        }

        // Build user message content array for OpenAI vision API
        // Format: content array with text and image_url items
        const userContentArray: any[] = [
          {
            type: 'text',
            text: userContent,
          },
        ];

        // Add images to content array in OpenAI vision format
        for (const imageDataUrl of imageDataUrls) {
          // Ensure it's a data URL format
          const dataUrl = imageDataUrl.startsWith('data:') 
            ? imageDataUrl 
            : `data:image/jpeg;base64,${imageDataUrl}`;
          
          userContentArray.push({
            type: 'image_url',
            image_url: {
              url: dataUrl,
            },
          });
          console.log('[LLMProvider] Added image to content array, URL length:', dataUrl.length);
        }

        // Format messages for OpenAI API (with vision support)
        const messages: any[] = [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            // Use content array format for vision (includes text + images)
            content: imageDataUrls.length > 0 ? userContentArray : userContent,
          },
        ];

        console.log('[LLMProvider] User message has', imageDataUrls.length > 0 ? `${userContentArray.length} content items (text + ${imageDataUrls.length} images)` : 'text only');

        console.log('[LLMProvider] Messages prepared:', messages.length, 'messages');
        console.log('[LLMProvider] System message preview:', systemPrompt.substring(0, 100) + '...');
        console.log('[LLMProvider] Images included in user message:', imageDataUrls.length);
        if (imageDataUrls.length > 0) {
          console.log('[LLMProvider] ✅ PHOTO WILL BE ANALYZED - Image data is included in the request');
          console.log('[LLMProvider] User message content format:', Array.isArray(messages[1].content) ? 'Array (vision format)' : 'String (text only)');
        } else {
          console.warn('[LLMProvider] ⚠️ No photo data found - only text analysis will be performed');
        }

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

        console.log('[LLMProvider] Calling streamChat...');
        yield* streamChat(messages, meta);
        console.log('[LLMProvider] streamChat completed successfully');
        return;
      } catch (err: any) {
        console.error('[LLMProvider] ChatGPT 4o mini failed:', err);
        console.error('[LLMProvider] Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name,
        });
        throw new Error(`ChatGPT 4o mini error: ${err.message}`);
      }
    }
    
    if (selectedModel === 'claude-code') {
      // Try Claude Code (requires online and API key)
      console.log('[LLMProvider] Claude Code selected, checking requirements...');
      
      if (!navigator.onLine) {
        console.warn('[LLMProvider] Device is offline');
        throw new Error('Claude Code requires internet connection');
      }
      
      const { getUserApiKey } = await import('../config/userKey');
      const hasKey = getUserApiKey();
      
      console.log('[LLMProvider] API key check:', hasKey ? 'Found' : 'Not found');
      
      if (!hasKey) {
        throw new Error('Claude Code requires API key. Please set it using the 🔑 button.');
      }
      
      try {
        console.log('[LLMProvider] Using Claude Code (User Selected)');
        this.stats = { provider: 'claude-api', model: 'claude-code' };
        
        const systemPrompt = this.buildEnhancedSystemPrompt(input.visitContext);
        console.log('[LLMProvider] Enhanced system prompt length:', systemPrompt.length);
        
        let userContent = input.text;
        if (input.location) {
          userContent += `\n\nLocation: ${input.location.lat.toFixed(6)}, ${input.location.lon.toFixed(6)}`;
        }

        // Extract image data from visit context for Claude vision
        // Anthropic Claude supports images in content array format
        const imageDataUrls: string[] = [];
        if (input.visitContext?.current?.photo) {
          imageDataUrls.push(input.visitContext.current.photo);
          console.log('[LLMProvider] Current photo found for Claude Code, length:', input.visitContext.current.photo.length);
        }
        if (input.visitContext?.allVisits) {
          for (const visit of input.visitContext.allVisits) {
            if (visit.photo_data && !imageDataUrls.includes(visit.photo_data)) {
              imageDataUrls.push(visit.photo_data);
              console.log('[LLMProvider] Saved visit photo found for Claude Code, length:', visit.photo_data.length);
            }
          }
        }
        if (imageDataUrls.length === 0 && input.visitContext?.latest?.photo_data) {
          imageDataUrls.push(input.visitContext.latest.photo_data);
          console.log('[LLMProvider] Latest saved photo found for Claude Code (fallback), length:', input.visitContext.latest.photo_data.length);
        }

        console.log('[LLMProvider] Total images to send to Claude Code:', imageDataUrls.length);

        // Build messages for Anthropic API format
        // Anthropic uses messages array with content blocks
        const messages: any[] = [];
        
        // Add system message (Anthropic supports system messages)
        if (systemPrompt) {
          messages.push({
            role: 'system',
            content: systemPrompt,
          });
        }

        // Build user message content blocks
        const userContentBlocks: any[] = [
          {
            type: 'text',
            text: userContent,
          },
        ];

        // Add images to content blocks (Anthropic format)
        for (const imageDataUrl of imageDataUrls) {
          const dataUrl = imageDataUrl.startsWith('data:') 
            ? imageDataUrl 
            : `data:image/jpeg;base64,${imageDataUrl}`;
          
          // Extract base64 data from data URL
          const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : imageDataUrl;
          const mimeType = dataUrl.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
          
          userContentBlocks.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64Data,
            },
          });
          console.log('[LLMProvider] Added image to Claude content blocks, mime type:', mimeType);
        }

        messages.push({
          role: 'user',
          content: userContentBlocks,
        });

        console.log('[LLMProvider] User message has', imageDataUrls.length > 0 ? `${userContentBlocks.length} content blocks (text + ${imageDataUrls.length} images)` : 'text only');
        console.log('[LLMProvider] Messages prepared for Claude:', messages.length, 'messages');

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

        // Use streamChat with provider header to indicate Claude
        // The server will need to handle the X-Provider header
        console.log('[LLMProvider] Calling streamChat with Claude Code...');
        yield* streamChat(messages, meta, 'claude-code');
        console.log('[LLMProvider] streamChat completed successfully');
        return;
      } catch (err: any) {
        console.error('[LLMProvider] Claude Code failed:', err);
        console.error('[LLMProvider] Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name,
        });
        throw new Error(`Claude Code error: ${err.message}`);
      }
    }
    
    // Auto mode: Try fallback order (original behavior)
    // Priority 1: Try Gemini Nano (offline, best quality, multimodal)
    // NOTE: Gemini Nano only works on Android 14+ devices with AICore
    try {
      const { Capacitor } = await import('@capacitor/core');
      // Skip Gemini Nano on web - use Cloud API instead
      if (Capacitor.isNativePlatform()) {
        const available = await geminiNano.isAvailable();
        if (available) {
          console.log('[LLMProvider] Using Gemini Nano (Priority 1 - Offline)');
          this.stats = { provider: 'gemini-nano', model: 'auto' };
          
          // Build enhanced prompt
          const enhancedPrompt = this.buildEnhancedSystemPrompt(input.visitContext);
          const fullPrompt = `${enhancedPrompt}\n\nUser: ${input.text}\n\nAssistant:`;
          
          // Extract image data from visit context (current photo + all saved visit photos)
          const images: string[] = [];
          if (input.visitContext?.current?.photo) {
            images.push(input.visitContext.current.photo);
            console.log('[LLMProvider] Current photo found (auto mode), length:', input.visitContext.current.photo.length);
          }
          // Add photos from all saved visits (prioritize most recent)
          if (input.visitContext?.allVisits) {
            for (const visit of input.visitContext.allVisits) {
              if (visit.photo_data && !images.includes(visit.photo_data)) {
                images.push(visit.photo_data);
                console.log('[LLMProvider] Saved visit photo found (auto mode), length:', visit.photo_data.length);
              }
            }
          }
          // Fallback to latest if allVisits not available
          if (images.length === 0 && input.visitContext?.latest?.photo_data) {
            images.push(input.visitContext.latest.photo_data);
            console.log('[LLMProvider] Latest saved photo found (auto mode fallback), length:', input.visitContext.latest.photo_data.length);
          }
          
          console.log('[LLMProvider] Total images to send to Gemini Nano (auto mode):', images.length);
          if (images.length > 0) {
            console.log('[LLMProvider] ✅ PHOTO WILL BE ANALYZED - Image data is included in the request');
          }
          
          yield* geminiNano.stream({
            text: fullPrompt,
            location: input.location,
            image: images.length > 0 ? images[0] : undefined, // Gemini Nano supports single image
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

          // Extract image data from visit context for GPT-4o mini vision
          // OpenAI GPT-4o vision requires images in content array format
          // Include current photo + all saved visit photos (prioritize most recent)
          const imageDataUrls: string[] = [];
          if (input.visitContext?.current?.photo) {
            imageDataUrls.push(input.visitContext.current.photo);
            console.log('[LLMProvider] Current photo found (auto mode), length:', input.visitContext.current.photo.length);
          }
          // Add photos from all saved visits
          if (input.visitContext?.allVisits) {
            for (const visit of input.visitContext.allVisits) {
              if (visit.photo_data && !imageDataUrls.includes(visit.photo_data)) {
                imageDataUrls.push(visit.photo_data);
                console.log('[LLMProvider] Saved visit photo found (auto mode), length:', visit.photo_data.length);
              }
            }
          }
          // Fallback to latest if allVisits not available
          if (imageDataUrls.length === 0 && input.visitContext?.latest?.photo_data) {
            imageDataUrls.push(input.visitContext.latest.photo_data);
            console.log('[LLMProvider] Latest saved photo found (auto mode fallback), length:', input.visitContext.latest.photo_data.length);
          }

          console.log('[LLMProvider] Total images to send to GPT-4o mini (auto mode):', imageDataUrls.length);

          // Build user message content array for OpenAI vision API
          const userContentArray: any[] = [
            {
              type: 'text',
              text: userContent,
            },
          ];

          // Add images to content array in OpenAI vision format
          for (const imageDataUrl of imageDataUrls) {
            const dataUrl = imageDataUrl.startsWith('data:') 
              ? imageDataUrl 
              : `data:image/jpeg;base64,${imageDataUrl}`;
            
            userContentArray.push({
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            });
          }

          // Format messages for OpenAI API (with vision support)
          const messages: any[] = [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              // Use content array format for vision (includes text + images)
              content: imageDataUrls.length > 0 ? userContentArray : userContent,
            },
          ];

          console.log('[LLMProvider] User message has', imageDataUrls.length > 0 ? `${userContentArray.length} content items (text + ${imageDataUrls.length} images)` : 'text only');

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
        errorMsg += `3. Cloud API (ChatGPT/Claude) - ❌ Failed\n`;
      } else {
        errorMsg += `3. Cloud API (ChatGPT/Claude Code) - ⏭️ Skipped (no API key provided)\n`;
        errorMsg += `\n💡 **Solution:** Set API key using 🔑 button to enable Cloud API fallback (ChatGPT 4o mini or Claude Code).`;
      }
    } else {
      errorMsg += `3. Cloud API (ChatGPT/Claude Code) - ⏭️ Skipped (device offline)\n`;
    }
    
    errorMsg += `\n**To fix:** Install Gemini Nano (Android 14+) or Llama Local model, or set API key for Cloud API (ChatGPT 4o mini or Claude Code).`;
    
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

