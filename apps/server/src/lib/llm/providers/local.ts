import { Ollama } from 'ollama';

export class LocalProvider {
  private ollama: Ollama;

  constructor() {
    this.ollama = new Ollama({
      host: process.env.OLLAMA_HOST || 'http://localhost:11434',
    });
  }

  async stream(
    messages: any[],
    _options: { model?: string }
  ): Promise<AsyncIterable<string>> {
    const models = await this.ollama.list();
    const modelName = _options.model || 'llama3.2';

    if (!models.models.find((m) => m.name.includes(modelName))) {
      throw new Error(`Model ${modelName} not available locally`);
    }

    const stream = await this.ollama.chat({
      model: modelName,
      messages,
      stream: true,
    });

    const asyncStream = (async function* () {
      for await (const chunk of stream) {
        yield chunk.message.content || '';
      }
    })();

    return asyncStream;
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.ollama.list();
      return true;
    } catch {
      return false;
    }
  }
}
