import isOnline from 'is-online';
import { APIProvider } from './api';
import { LocalProvider } from './local';

export class HybridProvider {
  private api: APIProvider;
  private local: LocalProvider;

  constructor() {
    this.api = new APIProvider();
    this.local = new LocalProvider();
  }

  async stream(
    messages: any[],
    options: {
      strategy?: string;
      model?: string;
      provider?: string;
      allowAPI?: boolean;
    }
  ): Promise<AsyncIterable<string>> {
    const strategy = options.strategy || 'auto';

    if (strategy === 'api-first') {
      try {
        return await this.api.stream(messages, options);
      } catch (err) {
        if (await this.local.isAvailable()) {
          return await this.local.stream(messages, options);
        }
        throw err;
      }
    }

    if (strategy === 'local-first') {
      if (await this.local.isAvailable()) {
        return await this.local.stream(messages, options);
      }
      return await this.api.stream(messages, options);
    }

    // 'auto' strategy
    if (await isOnline() && options.allowAPI !== false) {
      try {
        return await this.api.stream(messages, options);
      } catch {
        // Fallback silently
      }
    }

    if (await this.local.isAvailable()) {
      return await this.local.stream(messages, options);
    }

    throw new Error('No LLM provider available');
  }
}
