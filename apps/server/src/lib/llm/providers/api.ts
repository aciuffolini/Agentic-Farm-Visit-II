import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class APIProvider {
  private clients: {
    openai?: OpenAI;
    anthropic?: any;
  };

  constructor() {
    this.clients = {
      openai: new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      }),
    };
  }

  async stream(
    messages: ChatCompletionMessageParam[],
    options: { provider?: string; model?: string }
  ): Promise<AsyncIterable<string>> {
    const provider = options.provider || 'openai';

    switch (provider) {
      case 'openai':
        return this.streamOpenAI(messages, options);
      default:
        throw new Error(`Unsupported API provider: ${provider}`);
    }
  }

  private async *streamOpenAI(
    messages: ChatCompletionMessageParam[],
    options: { model?: string }
  ): AsyncGenerator<string> {
    if (!this.clients.openai) {
      throw new Error('OpenAI client is not initialized');
    }

    const stream = await this.clients.openai.chat.completions.create({
      model: options.model || 'gpt-4o-mini',
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      yield chunk.choices[0]?.delta?.content || '';
    }
  }
}
