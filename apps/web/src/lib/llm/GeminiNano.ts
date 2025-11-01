/**
 * Gemini Nano Integration
 * On-device LLM for Android (future implementation)
 * For now, provides mock interface for development
 */

export interface GeminiNanoConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiNanoInput {
  text?: string;
  image?: string; // base64 or dataURL
  audio?: string; // base64 or dataURL
  location?: { lat: number; lon: number };
}

export interface GeminiNanoOutput {
  text: string;
  structured?: unknown;
  confidence?: number;
}

export class GeminiNano {
  private config: GeminiNanoConfig;

  constructor(config: GeminiNanoConfig = {}) {
    this.config = {
      model: config.model || "gemini-nano",
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 1000,
      ...config,
    };
  }

  /**
   * Generate text completion
   * TODO: Implement actual Gemini Nano SDK integration
   */
  async generate(input: GeminiNanoInput): Promise<GeminiNanoOutput> {
    // Mock implementation for development
    // TODO: Replace with actual Gemini Nano SDK when available
    
    if (input.image) {
      return this.analyzeImage(input);
    }
    
    if (input.text) {
      return this.processText(input);
    }

    return {
      text: "No input provided",
    };
  }

  /**
   * Analyze image (mock)
   */
  private async analyzeImage(input: GeminiNanoInput): Promise<GeminiNanoOutput> {
    // TODO: Implement Gemini Nano image analysis
    return {
      text: "Image analysis not yet implemented. Will use Gemini Nano for: crop health, pest detection, disease identification.",
      structured: {
        crop: "corn",
        health: "good",
        issues: [],
      },
      confidence: 0.85,
    };
  }

  /**
   * Process text (mock - improved extraction)
   * TODO: Replace with Gemini Nano actual processing
   */
  private async processText(input: GeminiNanoInput): Promise<GeminiNanoOutput> {
    const text = input.text?.toLowerCase() || "";
    const extracted: Record<string, any> = {};

    // Improved extraction patterns
    // Crop detection
    const cropPatterns = [
      { keywords: ["corn", "maize", "maíz"], crop: "corn" },
      { keywords: ["wheat", "trigo"], crop: "wheat" },
      { keywords: ["soy", "soybean", "soja"], crop: "soybean" },
      { keywords: ["rice", "arroz"], crop: "rice" },
      { keywords: ["cotton", "algodón"], crop: "cotton" },
    ];
    for (const pattern of cropPatterns) {
      if (pattern.keywords.some(k => text.includes(k))) {
        extracted.crop = pattern.crop;
        break;
      }
    }

    // Issue detection
    const issuePatterns = [
      { keywords: ["aphid", "aphids", "áfidos"], issue: "aphids" },
      { keywords: ["disease", "enfermedad", "fungus", "hongos"], issue: "disease" },
      { keywords: ["weed", "maleza"], issue: "weeds" },
      { keywords: ["drought", "sequía"], issue: "drought" },
      { keywords: ["pest", "plaga"], issue: "pests" },
      { keywords: ["nutrient", "nutriente", "fertilizer"], issue: "nutrient_deficiency" },
    ];
    for (const pattern of issuePatterns) {
      if (pattern.keywords.some(k => text.includes(k))) {
        extracted.issue = pattern.issue;
        break;
      }
    }

    // Severity extraction (1-5)
    const severityMatch = text.match(/\bseverity\s*:?\s*(\d)/i) || 
                         text.match(/severity\s*(\d)/i) ||
                         text.match(/\b(\d)\s*out\s*of\s*5/i);
    if (severityMatch) {
      const severity = parseInt(severityMatch[1]);
      if (severity >= 1 && severity <= 5) {
        extracted.severity = severity;
      }
    } else {
      // Infer from keywords
      if (text.includes("critical") || text.includes("severe") || text.includes("crítico")) {
        extracted.severity = 5;
      } else if (text.includes("major") || text.includes("grave")) {
        extracted.severity = 4;
      } else if (text.includes("moderate") || text.includes("moderado")) {
        extracted.severity = 3;
      } else if (text.includes("minor") || text.includes("menor")) {
        extracted.severity = 2;
      } else if (text.includes("slight") || text.includes("leve")) {
        extracted.severity = 1;
      }
    }

    // Field ID extraction
    const fieldMatch = text.match(/\bfield\s*:?\s*(\w+\s*\d+|\d+)/i) ||
                      text.match(/\bf(\d+)/i) ||
                      text.match(/campo\s*:?\s*(\w+)/i);
    if (fieldMatch) {
      extracted.field_id = fieldMatch[1].trim();
    }

    // Generate helpful response text
    let responseText = "";
    if (extracted.crop) {
      responseText += `Detected crop: ${extracted.crop}. `;
    }
    if (extracted.issue) {
      responseText += `Identified issue: ${extracted.issue}. `;
    }
    if (extracted.severity) {
      responseText += `Severity level: ${extracted.severity}/5. `;
    }
    if (!responseText) {
      responseText = "Analyzed your input. Please review the extracted fields.";
    }

    return {
      text: responseText || input.text || "",
      structured: extracted,
      confidence: Object.keys(extracted).length > 0 ? 0.75 : 0.5,
    };
  }

  /**
   * Stream completion (for chat)
   */
  async *stream(input: GeminiNanoInput): AsyncGenerator<string> {
    const response = await this.generate(input);
    
    // Generate contextual chat response
    let chatResponse = response.text;
    
    // If it's a chat question, generate a more helpful response
    if (input.text && !input.image) {
      const question = input.text.toLowerCase();
      const visitContext = (window as any).__VISIT_CONTEXT__;
      
      if (question.includes("help") || question.includes("what") || question.includes("how")) {
        chatResponse = "I can help you with field visits! I can extract information from your notes about crops, issues, severity, and field IDs. Try describing a field visit in natural language and I'll extract the structured data.";
        if (visitContext?.gps) {
          chatResponse += ` I can see you're at ${visitContext.gps.lat.toFixed(4)}, ${visitContext.gps.lon.toFixed(4)}.`;
        }
      } else if (question.includes("aphid") || question.includes("pest")) {
        chatResponse = "For aphids and pests, I recommend: 1) Monitor infestation levels weekly, 2) Consider biological controls like ladybugs, 3) Apply insecticidal soap or neem oil if severity > 3, 4) Rotate crops to break pest cycles.";
      } else if (question.includes("disease") || question.includes("fungus")) {
        chatResponse = "For diseases: 1) Identify the specific disease type, 2) Apply appropriate fungicide based on the crop, 3) Improve air circulation if possible, 4) Remove affected plants to prevent spread, 5) Adjust irrigation to avoid excess moisture.";
      } else if (question.includes("crop") || question.includes("plant")) {
        chatResponse = "For crop management: Make sure to record the crop type, any issues you observe, and severity level (1-5). This helps track field health over time and plan treatments.";
      } else {
        chatResponse = response.text || "I understand. Let me help you with that. Can you provide more details about your field visit?";
      }
    }
    
    // Mock streaming (simulate token-by-token)
    const words = chatResponse.split(" ");
    for (const word of words) {
      yield word + " ";
      await new Promise(resolve => setTimeout(resolve, 30)); // Faster streaming
    }
  }

  /**
   * Check if Gemini Nano is available
   */
  async isAvailable(): Promise<boolean> {
    // TODO: Check if Gemini Nano SDK is available on device
    // For now, return true (we'll use mock)
    return true;
  }
}

// Default instance
export const geminiNano = new GeminiNano();

