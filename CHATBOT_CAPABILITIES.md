# 🤖 Chatbot Capabilities

## Overview
The AI Assistant is a context-aware chatbot powered by **Gemini Nano** (on-device LLM) with fallback to server streaming. It supports multi-agent routing and agricultural domain expertise.

---

## 🎯 Core Capabilities

### 1. **Context-Aware Conversations**
- ✅ **GPS Location Awareness**: Uses current GPS coordinates from field visit
- ✅ **Visit Context**: Accesses captured data (notes, photos, audio)
- ✅ **Real-time Updates**: Receives updates as you capture field data

**Example:**
```
User: "What should I do about the aphids here?"
Bot: "For aphids at your location (40.7128, -74.0060), I recommend..."
```

---

### 2. **Intent-Based Routing**
Automatically routes queries to specialized agents:

| Intent | Keywords | Agent Type |
|--------|----------|------------|
| **Diagnostic** | "analyze", "diagnose", "disease" | Diagnostic Agent |
| **Planning** | "plan", "treatment", "schedule" | Planning Agent |
| **Analytics** | "trend", "analyze", "history" | Analytics Agent |
| **Field Extraction** | "extract", "field", "visit" | Field Agent |

**Example:**
```
User: "Analyze this photo for diseases"
→ Routes to Diagnostic Agent

User: "Create a treatment plan"
→ Routes to Planning Agent
```

---

### 3. **Agricultural Domain Knowledge**

#### **Pest Management**
- Aphids detection and treatment recommendations
- Pest lifecycle and control strategies
- Biological vs. chemical control options

**Example Response:**
> "For aphids and pests, I recommend: 
> 1) Monitor infestation levels weekly
> 2) Consider biological controls like ladybugs
> 3) Apply insecticidal soap or neem oil if severity > 3
> 4) Rotate crops to break pest cycles."

#### **Disease Management**
- Disease identification guidance
- Fungicide recommendations
- Prevention strategies

**Example Response:**
> "For diseases: 
> 1) Identify the specific disease type
> 2) Apply appropriate fungicide based on the crop
> 3) Improve air circulation if possible
> 4) Remove affected plants to prevent spread
> 5) Adjust irrigation to avoid excess moisture."

#### **Crop Management**
- Best practices for field recording
- Severity level guidance (1-5 scale)
- Field health tracking

---

### 4. **Structured Data Extraction**

Extracts structured fields from natural language:

**Supported Fields:**
- **Crop Type**: corn, wheat, soybean, rice, cotton (English/Spanish)
- **Issues**: aphids, disease, weeds, drought, pests, nutrient deficiency
- **Severity**: 1-5 scale (numeric or inferred from keywords)
- **Field ID**: Extracts from patterns like "Field 12", "F3", "campo 5"

**Example:**
```
Input: "Corn field with aphids, severity 3"
Output: {
  crop: "corn",
  issue: "aphids",
  severity: 3
}
```

**Keywords Supported:**
- English: corn, maize, wheat, soy, disease, aphid, pest, etc.
- Spanish: maíz, trigo, soja, enfermedad, áfido, plaga, etc.

---

### 5. **Offline-First Operation**

- ✅ **Gemini Nano**: Works offline on Android devices
- ✅ **Server Fallback**: Falls back to `/api/chat` streaming if Gemini Nano unavailable
- ✅ **No Internet Required**: Core functionality available offline

---

### 6. **Streaming Responses**

- ✅ **Token-by-Token Streaming**: Real-time response display
- ✅ **Smooth UX**: 30ms delay between words for natural reading
- ✅ **Non-Blocking**: Can send new messages while previous one streams

---

## 🎨 User Interface Features

### **Chat Drawer**
- ✅ **Slide-in Animation**: Smooth drawer from right side
- ✅ **Responsive**: Adapts to mobile (90vw) and desktop (420px)
- ✅ **Message History**: Maintains conversation context
- ✅ **Bubble Design**: User (right, indigo) vs AI (left, slate)
- ✅ **Enter to Send**: Press Enter to send (Shift+Enter for new line)

---

## 📊 Technical Architecture

### **Processing Flow:**

```
User Message
    ↓
Intent Detection (detectIntent)
    ↓
    ├─→ Specialized Agent? → Route to Agent (Swarm Router)
    │                         ↓
    │                    Agent Response
    │
    └─→ General Chat? → Gemini Nano (offline-first)
                         ↓
                    ┌─ Success → Stream Response
                    └─ Failure → Fallback to Server Streaming
```

### **Agents Available:**

1. **Field Agent** (field-agent-001)
   - Capabilities: field_inspection, extract_fields, capture_gps, capture_photo, capture_audio
   - Uses Gemini Nano for extraction

2. **Diagnostic Agent** (planned)
   - Handles: analyze, diagnose, disease detection

3. **Planning Agent** (planned)
   - Handles: plan, treatment, schedule

4. **Analytics Agent** (planned)
   - Handles: trend, analyze, history

---

## 🔮 Future Capabilities (Planned)

### **Multimodal Support**
- 📷 **Image Analysis**: Crop health, pest detection, disease identification (via Gemini Nano)
- 🎤 **Audio Processing**: Voice note transcription and analysis
- 📍 **Location-Based**: Weather, soil data, historical field data

### **Advanced Features**
- 🔄 **Multi-Turn Conversations**: Context-aware follow-ups
- 📈 **Data Visualization**: Charts and graphs in chat
- 🤝 **Multi-Agent Coordination**: Parallel agent collaboration
- 🌐 **Swarm Integration**: Interact with other agents in digital farm ecosystem

---

## 💡 Example Conversations

### **Field Data Extraction:**
```
User: "Corn field 12, aphids detected, severity 3"
Bot: "Detected crop: corn. Identified issue: aphids. Severity level: 3/5."
```

### **Agricultural Advice:**
```
User: "What should I do about aphids?"
Bot: "For aphids and pests, I recommend: 
1) Monitor infestation levels weekly
2) Consider biological controls like ladybugs
3) Apply insecticidal soap or neem oil if severity > 3
4) Rotate crops to break pest cycles."
```

### **Help & Guidance:**
```
User: "How can you help me?"
Bot: "I can help you with field visits! I can extract information from 
your notes about crops, issues, severity, and field IDs. Try describing 
a field visit in natural language and I'll extract the structured data. 
I can see you're at -34.6037, -58.3816."
```

---

## 🚀 Getting Started

1. **Open Chat**: Click "Chat" button in header
2. **Ask Questions**: Type your question or describe field visit
3. **Get Help**: Type "help" or "what can you do?" for guidance
4. **Extract Data**: Describe a visit and the bot will extract structured fields

---

## 📝 Notes

- **Current Implementation**: Uses mock Gemini Nano (pattern matching)
- **Production Ready**: When Gemini Nano SDK available, swap in seamlessly
- **Offline Support**: Designed for offline-first Android deployment
- **Extensible**: Easy to add new agents and capabilities

---

**The chatbot is your intelligent field assistant, ready to help with agricultural data capture, analysis, and recommendations!** 🌾


