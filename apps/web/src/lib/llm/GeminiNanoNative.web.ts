/**
 * Web implementation fallback (when not on Android)
 * Includes development mode mock for local testing
 */
export class GeminiNanoNativeWeb {
  private mockEnabled: boolean;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    // Enable mock in development mode (localhost or dev environment)
    this.mockEnabled = 
      typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       process.env.NODE_ENV === 'development');
  }

  async isAvailable(): Promise<{ 
    available: boolean; 
    reason?: string; 
    status?: string;
    downloadable?: boolean;
  }> {
    if (this.mockEnabled) {
      return {
        available: true,
        reason: 'Mock mode enabled for development',
        status: 'MOCK_AVAILABLE',
        downloadable: false,
      };
    }
    return {
      available: false,
      reason: 'Not on Android device',
    };
  }

  async initialize(): Promise<{ initialized: boolean; message: string }> {
    if (this.mockEnabled) {
      return {
        initialized: true,
        message: 'Mock Gemini Nano initialized (development mode)',
      };
    }
    return {
      initialized: false,
      message: 'Not available on web',
    };
  }

  async generate(options: { prompt: string }): Promise<{ text: string }> {
    if (this.mockEnabled) {
      // Mock response for development testing
      return this.generateMockResponse(options.prompt);
    }
    return {
      text: 'Gemini Nano not available on web platform',
    };
  }

  async stream(options: { prompt: string }): Promise<void> {
    if (this.mockEnabled) {
      // Simulate streaming in mock mode
      const response = await this.generateMockResponse(options.prompt);
      const words = response.text.split(' ');
      
      // Stream words with delay
      for (let i = 0; i < words.length; i++) {
        setTimeout(() => {
          this.notifyListeners('streamChunk', {
            text: words[i] + (i < words.length - 1 ? ' ' : ''),
            done: i === words.length - 1,
          });
        }, i * 30);
      }
    }
    // No-op on web production
  }

  addListener(eventName: string, listenerFunc: (data: any) => void): { remove: () => void } {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(listenerFunc);

    return {
      remove: () => {
        const listeners = this.listeners.get(eventName);
        if (listeners) {
          listeners.delete(listenerFunc);
        }
      },
    };
  }

  private notifyListeners(eventName: string, data: any): void {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (err) {
          console.error('[GeminiNanoNativeWeb] Listener error:', err);
        }
      });
    }
  }

  private async generateMockResponse(prompt: string): Promise<{ text: string }> {
    // Simulate delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));

    const lowerPrompt = prompt.toLowerCase();

    // Mock responses based on common farm visit queries
    if (lowerPrompt.includes('help') || lowerPrompt.includes('qué') || lowerPrompt.includes('what')) {
      return {
        text: 'I can help you with field visit information! I can assist with:\n\n' +
              '• Crop identification and management\n' +
              '• Pest and disease detection\n' +
              '• Field visit data extraction\n' +
              '• Agricultural best practices\n\n' +
              '(Note: This is a mock response for development. Real Gemini Nano requires Android 14+)',
      };
    }

    if (lowerPrompt.includes('aphid') || lowerPrompt.includes('áfido')) {
      return {
        text: 'For aphids, I recommend:\n\n' +
              '1. Monitor infestation levels weekly\n' +
              '2. Consider biological controls like ladybugs\n' +
              '3. Apply insecticidal soap or neem oil if severity > 3\n' +
              '4. Rotate crops to break pest cycles\n\n' +
              '(Mock response - Android testing required for real AI)',
      };
    }

    if (lowerPrompt.includes('corn') || lowerPrompt.includes('maíz') || lowerPrompt.includes('maize')) {
      return {
        text: 'Corn field detected. For corn management:\n\n' +
              '• Ensure proper soil pH (6.0-6.8)\n' +
              '• Monitor for common pests: aphids, corn borers\n' +
              '• Watch for diseases: rust, blight\n' +
              '• Maintain adequate irrigation\n\n' +
              '(Development mode response)',
      };
    }

    if (lowerPrompt.includes('disease') || lowerPrompt.includes('enfermedad')) {
      return {
        text: 'For disease management:\n\n' +
              '1. Identify the specific disease type\n' +
              '2. Apply appropriate fungicide based on crop\n' +
              '3. Improve air circulation if possible\n' +
              '4. Remove affected plants to prevent spread\n' +
              '5. Adjust irrigation to avoid excess moisture\n\n' +
              '(Mock response for testing)',
      };
    }

    // Default mock response
    return {
      text: `I understand you're asking about: "${prompt}"\n\n` +
            'In a real Android deployment with Gemini Nano, I would provide a detailed, context-aware response based on:\n' +
            '• Your GPS location\n' +
            '• Current field visit data\n' +
            '• Agricultural domain knowledge\n\n' +
            'To test the real AI, please build the Android APK and test on an Android 14+ device.\n\n' +
            '(This is a development mock response)',
    };
  }
}

