import { ChatMessage, Visit } from '@farm-visit/shared';
import { getUserApiKey } from './config/userKey';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/ping`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
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

export async function* streamChat(
  messages: ChatMessage[],
  meta?: ChatRequest['meta'],
  provider?: string
): AsyncGenerator<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const userKey = getUserApiKey();
  if (userKey) {
    headers['X-API-Key'] = userKey;
  }

  if (provider) {
    headers['X-Provider'] = provider;
  }

  const url = `${API_BASE}/api/chat`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages, meta }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat API error: ${response.status} ${errorText}`);
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
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.token) {
              yield parsed.token;
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

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
