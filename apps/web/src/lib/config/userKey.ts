/**
 * User API Key Management
 * Stores API key locally (device storage)
 * Sent as X-API-Key header to backend
 */

export function getUserApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('user_api_key') || '';
}

export function setUserApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key) {
    localStorage.setItem('user_api_key', key);
  } else {
    localStorage.removeItem('user_api_key');
  }
}

// Global helper for quick setup on device
if (typeof window !== 'undefined') {
  (window as any).setAPIKey = setUserApiKey;
}

