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
      
      // Enhanced contextual responses
      if (question.includes("help") || question.includes("what can you") || question.includes("how do")) {
        chatResponse = "I can help you with field visits! Here's what I can do:\n\n";
        chatResponse += "📝 **Extract structured data** from your voice notes or text descriptions\n";
        chatResponse += "🌾 **Identify crops** (corn, wheat, soy, rice, cotton)\n";
        chatResponse += "🐛 **Detect issues** (pests, diseases, weeds, nutrient deficiencies)\n";
        chatResponse += "📊 **Suggest treatments** based on crop and issue type\n";
        chatResponse += "📍 **Track locations** using your GPS data\n\n";
        chatResponse += "Try saying: 'Field 12, corn, aphids, severity 3' and I'll extract all the details automatically!";
        if (visitContext?.gps) {
          chatResponse += `\n\n📍 Current location: ${visitContext.gps.lat.toFixed(4)}, ${visitContext.gps.lon.toFixed(4)}`;
        }
      } else if (question.includes("aphid") || question.includes("áfido") || question.includes("pest") || question.includes("plaga")) {
        chatResponse = "**Aphids & Pests - Treatment Guide:**\n\n";
        chatResponse += "1️⃣ **Monitoring**: Check infestation levels weekly, especially on new growth\n";
        chatResponse += "2️⃣ **Biological Control**: Introduce beneficial insects (ladybugs, lacewings)\n";
        chatResponse += "3️⃣ **Organic Treatment**: Apply insecticidal soap or neem oil (effective for mild-moderate infestations)\n";
        chatResponse += "4️⃣ **Chemical Treatment**: Use systemic insecticides only if severity > 3/5\n";
        chatResponse += "5️⃣ **Prevention**: Rotate crops, remove weeds, maintain field borders\n\n";
        chatResponse += "⚠️ For severity 4-5: Consider immediate treatment to prevent crop damage.";
      } else if (question.includes("disease") || question.includes("enfermedad") || question.includes("fungus") || question.includes("hongo")) {
        chatResponse = "**Disease Management - Steps:**\n\n";
        chatResponse += "1️⃣ **Identification**: Determine specific disease type (fungal, bacterial, viral)\n";
        chatResponse += "2️⃣ **Treatment**: Apply appropriate fungicide/bactericide based on crop and disease\n";
        chatResponse += "3️⃣ **Cultural Practices**: Improve air circulation, reduce plant density if possible\n";
        chatResponse += "4️⃣ **Sanitation**: Remove and destroy affected plants to prevent spread\n";
        chatResponse += "5️⃣ **Irrigation**: Adjust watering schedule - avoid excess moisture, water at base\n";
        chatResponse += "6️⃣ **Monitoring**: Track disease progression and treatment effectiveness";
      } else if (question.includes("crop") || question.includes("cultivo") || question.includes("plant") || question.includes("planta")) {
        chatResponse = "**Crop Management Tips:**\n\n";
        chatResponse += "📋 **When recording a visit**, include:\n";
        chatResponse += "  • Crop type (corn, wheat, soy, etc.)\n";
        chatResponse += "  • Field ID or name\n";
        chatResponse += "  • Issues observed (pests, diseases, weeds)\n";
        chatResponse += "  • Severity level (1-5 scale)\n\n";
        chatResponse += "This data helps:\n";
        chatResponse += "✅ Track field health over time\n";
        chatResponse += "✅ Plan treatment schedules\n";
        chatResponse += "✅ Compare field performance\n";
        chatResponse += "✅ Generate reports";
      } else if (question.includes("field") || question.includes("campo")) {
        chatResponse = "For field visits, I can extract:\n\n";
        chatResponse += "📍 **Location**: GPS coordinates\n";
        chatResponse += "🌾 **Crop**: Type of crop planted\n";
        chatResponse += "🐛 **Issues**: Pests, diseases, weeds, nutrient problems\n";
        chatResponse += "📊 **Severity**: 1 (mild) to 5 (critical)\n";
        chatResponse += "📝 **Notes**: Your observations\n\n";
        chatResponse += "Just describe what you see and I'll structure it automatically!";
      } else {
        // More general helpful response
        const hasContext = visitContext?.gps || visitContext?.hasPhoto || visitContext?.lastNote;
        if (hasContext) {
          chatResponse = "I can help you with that! ";
          if (visitContext?.gps) {
            chatResponse += `I see you're at location ${visitContext.gps.lat.toFixed(4)}, ${visitContext.gps.lon.toFixed(4)}. `;
          }
          if (visitContext?.lastNote) {
            chatResponse += `I noticed you've recorded: "${visitContext.lastNote.substring(0, 50)}${visitContext.lastNote.length > 50 ? '...' : ''}". `;
          }
          chatResponse += "Would you like me to extract structured data from your notes, or help you with field visit questions?";
        } else {
          chatResponse = "I'm here to help with your field visits! Try asking about:\n\n";
          chatResponse += "• Crop management\n";
          chatResponse += "• Pest identification and treatment\n";
          chatResponse += "• Disease diagnosis\n";
          chatResponse += "• Recording field visit data\n";
          chatResponse += "• General farming questions\n\n";
          chatResponse += "Or describe a field visit and I'll extract the structured information automatically.";
        }
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

