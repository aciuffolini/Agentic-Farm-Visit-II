import { ChatMessage } from '@farm-visit/shared';
import { streamChat as streamCloudChat } from '../api';

class LLMService {
  async *chat(
    messages: ChatMessage[]
  ): AsyncGenerator<{ token: string; source: 'cloud' }> {
    if (!navigator.onLine) {
      yield { token: 'You are offline. Please connect to the internet to use the chat.', source: 'cloud' };
      return;
    }

    try {
      for await (const token of streamCloudChat(messages)) {
        yield { token, source: 'cloud' };
      }
    } catch (error) {
      console.error('Cloud chat failed:', error);
      yield { token: 'An error occurred while connecting to the chat service.', source: 'cloud' };
    }
  }
}

export const llmService = new LLMService();
