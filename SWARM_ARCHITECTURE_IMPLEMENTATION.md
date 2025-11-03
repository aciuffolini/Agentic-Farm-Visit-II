# Swarm Agent Architecture - MVP Implementation

## 🎯 Vision: Digital Twin Beef Copilot with Swarm Agents

### Core Requirements
- **Multi-Agent**: Multiple specialized agents
- **Swarm Communication**: Agents can interact with each other
- **Ray-Ban Meta**: Smart glasses compatibility
- **Digital Farm**: Ecosystem of connected agents
- **Offline-First**: Agents work independently and sync later

---

## 🏗️ Architecture Changes Needed in MVP

### 1. Agent Registry & Discovery

**New Component**: `AgentRegistry`

Purpose: Track available agents and their capabilities

```typescript
// apps/web/src/lib/agents/AgentRegistry.ts

interface AgentCapability {
  agentId: string;
  agentType: 'field' | 'diagnostic' | 'planning' | 'analytics' | 'rayban';
  capabilities: string[];
  endpoint?: string; // For remote agents
  status: 'online' | 'offline';
  metadata?: Record<string, unknown>;
}

class AgentRegistry {
  private agents: Map<string, AgentCapability> = new Map();
  
  register(agent: AgentCapability): void;
  discover(capability: string): AgentCapability[];
  get(agentId: string): AgentCapability | null;
  list(): AgentCapability[];
}
```

### 2. Agent Communication Protocol

**New Component**: `AgentMessaging`

Purpose: Standardized messaging between agents

```typescript
// apps/web/src/lib/agents/AgentMessaging.ts

interface AgentMessage {
  from: string; // agentId
  to: string | string[]; // agentId or broadcast
  type: 'request' | 'response' | 'event' | 'delegation';
  task: string;
  payload: unknown;
  schema?: string; // Zod schema name
  correlationId: string;
  timestamp: number;
}

class AgentMessaging {
  send(message: AgentMessage): Promise<void>;
  onMessage(handler: (msg: AgentMessage) => void): void;
  delegate(task: string, payload: unknown, toAgentId: string): Promise<unknown>;
  broadcast(event: string, payload: unknown): void;
}
```

### 3. Agent Base Class

**New Component**: `BaseAgent`

Purpose: Common interface for all agents

```typescript
// apps/web/src/lib/agents/BaseAgent.ts

interface AgentContext {
  visit?: Visit;
  user?: User;
  farm?: Farm;
  [key: string]: unknown;
}

abstract class BaseAgent {
  abstract agentId: string;
  abstract agentType: string;
  abstract capabilities: string[];
  
  abstract execute(
    task: string,
    input: unknown,
    context: AgentContext
  ): Promise<unknown>;
  
  register(): void;
  handleMessage(message: AgentMessage): Promise<void>;
}
```

### 4. Task Router (Enhanced)

**New Component**: `SwarmTaskRouter`

Purpose: Route tasks to appropriate agents (local or remote)

```typescript
// apps/web/src/lib/agents/SwarmTaskRouter.ts

class SwarmTaskRouter {
  private registry: AgentRegistry;
  private messaging: AgentMessaging;
  
  async route(
    intent: string,
    input: unknown,
    context: AgentContext
  ): Promise<{
    agent: BaseAgent;
    task: string;
    result: unknown;
  }>;
  
  async delegate(
    task: string,
    input: unknown,
    preferredAgent?: string
  ): Promise<unknown>;
}
```

### 5. Agent Service Discovery

**New Component**: `AgentDiscovery`

Purpose: Discover agents on local network or cloud

```typescript
// apps/web/src/lib/agents/AgentDiscovery.ts

interface DiscoveryConfig {
  method: 'local' | 'cloud' | 'hybrid';
  cloudEndpoint?: string;
  localPort?: number;
}

class AgentDiscovery {
  discover(config: DiscoveryConfig): Promise<AgentCapability[]>;
  advertise(agent: BaseAgent): void;
}
```

---

## 📦 New Files to Create

### Core Agent Infrastructure

1. `apps/web/src/lib/agents/BaseAgent.ts` - Base class for all agents
2. `apps/web/src/lib/agents/AgentRegistry.ts` - Agent registration/discovery
3. `apps/web/src/lib/agents/AgentMessaging.ts` - Inter-agent communication
4. `apps/web/src/lib/agents/SwarmTaskRouter.ts` - Task routing with delegation
5. `apps/web/src/lib/agents/AgentDiscovery.ts` - Service discovery

### Specific Agents

6. `apps/web/src/lib/agents/FieldAgent.ts` - Field inspection agent (current MVP)
7. `apps/web/src/lib/agents/DiagnosticAgent.ts` - Disease/pest identification
8. `apps/web/src/lib/agents/PlanningAgent.ts` - Treatment planning
9. `apps/web/src/lib/agents/AnalyticsAgent.ts` - Data analysis

### Communication Layer

10. `apps/web/src/lib/agents/transport/LocalTransport.ts` - In-app messaging
11. `apps/web/src/lib/agents/transport/WebSocketTransport.ts` - Remote agents
12. `apps/web/src/lib/agents/transport/MCPTransport.ts` - MCP protocol (reuse from 6_mcp/)

### Shared Schemas

13. `packages/shared/src/schemas/agent.ts` - Agent message schemas
14. `packages/shared/src/schemas/diagnostic.ts` - Diagnostic report schema
15. `packages/shared/src/schemas/treatment.ts` - Treatment plan schema

---

## 🔄 Updated Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Farm Visit App (Field Agent)                │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │           Sensor Layer                          │   │
│  │  • GPS • Camera • Microphone                    │   │
│  └────────────────────┬────────────────────────────┘   │
│                       │                                  │
│  ┌────────────────────▼────────────────────────────┐   │
│  │           Swarm Agent System                     │   │
│  │  ┌────────────┐  ┌────────────┐                │   │
│  │  │   Agent    │  │  Task      │                │   │
│  │  │  Registry  │  │  Router    │                │   │
│  │  └────────────┘  └────────────┘                │   │
│  │                       │                          │   │
│  │  ┌────────────────────▼────────────┐           │   │
│  │  │     Agent Messaging              │           │   │
│  │  │  • Local (in-app)                 │           │   │
│  │  │  • WebSocket (remote)             │           │   │
│  │  │  • MCP (standard protocol)        │           │   │
│  │  └──────────────────────────────────┘           │   │
│  └────────────────────┬────────────────────────────┘   │
│                       │                                  │
├───────────────────────┼──────────────────────────────────┤
│                       │                                  │
│  ┌────────────────────▼────────────────────────────┐   │
│  │           Gemini Nano (On-Device LLM)            │   │
│  │  • Text • Image • Audio • Multi-modal            │   │
│  └──────────────────────────────────────────────────┘   │
│                       │                                  │
├───────────────────────┼──────────────────────────────────┤
│                       │                                  │
│  ┌────────────────────▼────────────────────────────┐   │
│  │      Agent Communication Layer                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │   │
│  │  │ Local    │  │WebSocket │  │   MCP    │      │   │
│  │  │ Transport│  │Transport │  │Transport │      │   │
│  │  └──────────┘  └──────────┘  └──────────┘      │   │
│  └──────────────────────────────────────────────────┘   │
│                       │                                  │
└───────────────────────┼──────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐
│  Diagnostic  │ │  Planning   │ │ Analytics │
│    Agent     │ │   Agent     │ │   Agent   │
│   (Cloud)    │ │   (Cloud)   │ │  (Cloud)  │
└──────────────┘ └─────────────┘ └───────────┘

Future:
┌──────────────┐
│ Ray-Ban Meta │
│    Agent     │
│  (Glasses)   │
└──────────────┘
```

---

## 🔧 Implementation Plan

### Step 1: Foundation (MVP Enhancement)
- [ ] Create BaseAgent abstract class
- [ ] Implement AgentRegistry
- [ ] Implement AgentMessaging (local only first)
- [ ] Refactor FieldVisit to use FieldAgent

### Step 2: Task Routing
- [ ] Create SwarmTaskRouter
- [ ] Implement task detection
- [ ] Add agent delegation capability

### Step 3: Communication
- [ ] Add WebSocket transport for remote agents
- [ ] Add MCP transport (reuse from 6_mcp/)
- [ ] Implement message queue for offline

### Step 4: Ray-Ban Ready
- [ ] Sensor abstraction already supports Ray-Ban
- [ ] Add Ray-Ban agent class (placeholder)
- [ ] Voice command routing

---

## 📝 Key Decisions Made

1. **Discovery**: Hybrid (local-first, cloud fallback)
2. **Communication**: Multi-transport (Local, WebSocket, MCP)
3. **State**: Event-driven with local cache
4. **Orchestration**: Decentralized with smart routing
5. **Offline**: Queue messages, sync when online

---

**Ready to implement this architecture in the MVP?** 🚀


