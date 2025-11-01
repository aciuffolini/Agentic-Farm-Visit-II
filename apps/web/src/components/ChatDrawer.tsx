import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { streamChat } from '../lib/api';
import { ChatMessage } from '@farm-visit/shared';
import { swarmTaskRouter } from '../lib/agents/SwarmTaskRouter';
import { geminiNano } from '../lib/llm/GeminiNano';

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I can help you with field visit information. Ask me anything!' },
  ]);

  const send = async () => {
    if (!input.trim() || busy) return;

    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setBusy(true);

    // Get visit context
    const visitContext = (window as any).__VISIT_CONTEXT__ || null;
    const meta = {
      visit: visitContext,
    };

    try {
      // Check if this is a task that should be routed to an agent
      const intent = detectIntent(userMsg.content);
      
      if (intent && intent !== 'chat') {
        // Route to appropriate agent via swarm
        try {
          const result = await swarmTaskRouter.route(
            intent,
            { question: userMsg.content, messages },
            { visit: visitContext }
          );
          
          const assistantMsg: ChatMessage = {
            role: 'assistant',
            content: typeof result.result === 'string' 
              ? result.result 
              : JSON.stringify(result.result, null, 2),
          };
          setMessages((m) => [...m, assistantMsg]);
          return;
        } catch (agentErr) {
          console.warn("Agent routing failed, falling back to chat:", agentErr);
        }
      }

      // Default: Use Gemini Nano (on-device) or streaming chat
      const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
      setMessages((m) => [...m, assistantMsg]);

      // Try Gemini Nano first (offline, on-device)
      try {
        const visitContext = (window as any).__VISIT_CONTEXT__;
        
        // Stream response for better UX
        for await (const chunk of geminiNano.stream({
          text: userMsg.content,
          location: visitContext?.gps 
            ? { lat: visitContext.gps.lat, lon: visitContext.gps.lon }
            : undefined,
        })) {
          setMessages((m) => {
            const copy = [...m];
            const last = copy[copy.length - 1];
            if (last && last.role === 'assistant') {
              copy[copy.length - 1] = { ...last, content: last.content + chunk };
            }
            return copy;
          });
        }
        return;
      } catch (nanoErr) {
        console.warn("Gemini Nano failed, falling back to streaming chat:", nanoErr);
        
        // Fallback: Use server streaming chat
        try {
          for await (const chunk of streamChat([...messages, userMsg], meta)) {
            setMessages((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              if (last && last.role === 'assistant') {
                copy[copy.length - 1] = { ...last, content: last.content + chunk };
              }
              return copy;
            });
          }
        } catch (streamErr) {
          // Final fallback: Simple response
          setMessages((m) => {
            const copy = [...m];
            const last = copy[copy.length - 1];
            if (last && last.role === 'assistant') {
              copy[copy.length - 1] = { 
                ...last, 
                content: "I'm here to help with your field visits! Try asking about crops, pests, diseases, or help with recording visit data."
              };
            }
            return copy;
          });
        }
      }
    } catch (err: any) {
      setMessages((m) => {
        const copy = [...m];
        const last = copy[copy.length - 1];
        if (last && last.role === 'assistant') {
          copy[copy.length - 1] = { ...last, content: `Error: ${err.message}` };
        }
        return copy;
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          className="fixed right-0 top-0 z-40 h-full w-[min(500px,95vw)] border-l border-slate-200 bg-white shadow-xl flex flex-col"
        >
          <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200">
            <div className="font-semibold">AI Assistant</div>
            <button onClick={onClose} className="text-slate-500 text-sm">
              Close
            </button>
          </div>

          <div className="flex-1 p-3 space-y-2 overflow-auto">
            {messages.map((m, i) => (
              <ChatBubble
                key={i}
                who={m.role === 'assistant' ? 'AI' : 'You'}
                text={m.content}
                align={m.role === 'user' ? 'right' : 'left'}
              />
            ))}
          </div>

          <div className="border-t border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask AI..."
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                disabled={busy}
              />
              <button
                disabled={busy || !input.trim()}
                onClick={send}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:shadow disabled:opacity-50"
              >
                {busy ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/**
 * Simple intent detection for routing to agents
 */
function detectIntent(message: string): string | null {
  const lower = message.toLowerCase();
  
  if (lower.includes('analyze') || lower.includes('diagnose') || lower.includes('disease')) {
    return 'diagnostic';
  }
  if (lower.includes('plan') || lower.includes('treatment') || lower.includes('schedule')) {
    return 'planning';
  }
  if (lower.includes('trend') || lower.includes('analyze') || lower.includes('history')) {
    return 'analytics';
  }
  if (lower.includes('extract') || lower.includes('field') || lower.includes('visit')) {
    return 'extract_fields';
  }
  
  return null; // Default to chat
}

function ChatBubble({ who, text, align }: { who: string; text: string; align: 'left' | 'right' }) {
  return (
    <div className={`flex ${align === 'right' ? 'justify-end' : ''}`}>
      <div
        className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm shadow-sm ${
          align === 'right'
            ? 'bg-indigo-50 border-indigo-100'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">{who}</div>
        <div className="whitespace-pre-wrap">{text}</div>
      </div>
    </div>
  );
}

