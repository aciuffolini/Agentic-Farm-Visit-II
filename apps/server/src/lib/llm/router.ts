import { APIProvider } from './providers/api';
import { LocalProvider } from './providers/local';
import { HybridProvider } from './providers/hybrid';

export class LLMRouter {
  private api: APIProvider;
  private local: LocalProvider;
  private hybrid: HybridProvider;

  constructor() {
    this.api = new APIProvider();
    this.local = new LocalProvider();
    this.hybrid = new HybridProvider();
  }

  async stream(
    messages: any[],
    _meta: any,
    preferences?: { strategy?: string; model?: string; provider?: string }
  ): Promise<{
    stream: AsyncIterable<string>;
    provider: string;
    model: string;
  }> {
    const strategy = preferences?.strategy || this.detectStrategy(_meta);

    let provider: APIProvider | LocalProvider | HybridProvider;
    let providerName: string;

    switch (strategy) {
      case 'api':
        provider = this.api;
        providerName = 'api';
        break;
      case 'local':
        provider = this.local;
        providerName = 'local';
        break;
      case 'hybrid':
        provider = this.hybrid;
        providerName = 'hybrid';
        break;
      default:
        throw new Error(`Unsupported LLM strategy: ${strategy}`);
    }

    const stream = await provider.stream(messages, {
      model: preferences?.model,
      provider: preferences?.provider,
      strategy,
    });

    return {
      stream,
      provider: providerName,
      model: preferences?.model || 'default',
    };
  }

  private detectStrategy(_meta: any): 'api' | 'local' | 'hybrid' {
    if (process.env.FORCE_LOCAL === 'true') return 'local';
    if (process.env.FORCE_API === 'true') return 'api';
    return 'hybrid';
  }
}
