/**
 * API Client
 * Handles HTTP requests and SSE streaming
 */

import { ChatMessage, Visit } from '@farm-visit/shared';
import { getUserApiKey } from './config/userKey';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Check if the test server is running
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

export interface ChatRequest {
  messages: ChatMessage[];
  meta?: {
    visit?: {
      gps?: { lat: number; lon: number; acc: number };
      lastNote?: string;
      hasPhoto?: boolean;
    };
    intent?: 'structure' | 'chat';
  };
}

export interface ChatResponse {
  token: string;
  provider?: string;
  model?: string;
}

/**
 * Stream chat response (SSE)
 */
export async function* streamChat(
  messages: ChatMessage[],
  meta?: ChatRequest['meta'],
  provider?: string
): AsyncGenerator<string> {
  // Build headers with optional user API key
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add user API key if available (per-device, stored locally)
  const userKey = getUserApiKey();
  if (userKey) {
    headers['X-API-Key'] = userKey;
    console.log('[API] Using user-provided API key:', userKey.substring(0, 10) + '...');
  } else {
    console.warn('[API] No API key found in localStorage');
  }
  
  // Add provider selection header if specified
  if (provider) {
    headers['X-Provider'] = provider;
    headers['X-Model'] = provider; // Also send as model for server routing
    console.log('[API] Using provider:', provider);
  }

  const url = `${API_BASE}/chat`;
  console.log('[API] Request URL:', url);
  console.log('[API] Request headers:', { ...headers, 'X-API-Key': headers['X-API-Key'] ? `${headers['X-API-Key'].substring(0, 10)}...` : 'NOT SET' });
  console.log('[API] Request body:', { messages: messages.length, meta });

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages, meta }),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });
  } catch (fetchError: any) {
    // Handle network errors (ECONNREFUSED, network failures, etc.)
    const errorMsg = fetchError?.message || String(fetchError);
    const errorName = fetchError?.name || '';
    
    // Check for connection refused errors
    if (errorMsg.includes('ECONNREFUSED') || 
        errorMsg.includes('Failed to fetch') ||
        errorMsg.includes('NetworkError') ||
        errorMsg.includes('ERR_CONNECTION_REFUSED') ||
        errorMsg.includes('AbortError') ||
        errorName === 'TypeError' ||
        errorName === 'AbortError') {
      
      // More specific error message
      if (errorMsg.includes('AbortError') || errorName === 'AbortError') {
        throw new Error('Request timeout. The server may not be running or is taking too long to respond. Start the test server with: node test-server.js');
      }
      
      throw new Error('Cannot connect to API server. The test server is not running. Start it with: node test-server.js in the apps/web folder');
    }
    throw new Error(`Network error: ${errorMsg}`);
  }
  
  console.log('[API] Response status:', response.status, response.statusText);
  console.log('[API] Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    // Handle 503 (Service Unavailable) - server not running
    if (response.status === 503) {
      try {
        const errorData = await response.json();
        throw new Error(`API server unavailable: ${errorData.message || 'Test server is not running. Start it with: node test-server.js'}`);
      } catch {
        throw new Error('API server unavailable. Test server is not running. Start it with: node test-server.js');
      }
    }
    
    const text = await response.text();
    let errorMessage = `Chat API error: ${response.status}`;
    
    // Try to parse error message
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      if (text) errorMessage += ` ${text}`;
    }
    
    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            console.log('[API] Stream complete');
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            // OpenAI SSE format: { choices: [{ delta: { content: "..." } }] }
            const content = parsed.choices?.[0]?.delta?.content || parsed.token || '';
            if (content) {
              yield content;
            }
          } catch (e) {
            // Not JSON, yield as-is (fallback)
            if (data && data !== '') {
              yield data;
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Save visit to server
 */
export async function saveVisit(visit: Visit): Promise<{ success: boolean; id: string }> {
  const response = await fetch(`${API_BASE}/visits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visit),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Save visit error: ${response.status} ${text}`);
  }

  return response.json();
}

/**
 * Get list of visits from server
 */
export async function getVisits(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ visits: Visit[]; total: number; hasMore: boolean }> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const response = await fetch(`${API_BASE}/visits?${searchParams}`);
  
  if (!response.ok) {
    throw new Error(`Get visits error: ${response.status}`);
  }

  return response.json();
}


