/**
 * Chat Drawer Component
 * Uses unified LLM Provider with automatic fallback:
 * 1. Gemini Nano (Android 14+ with AICore)
 * 2. Llama Local (Android 7+, offline fallback)
 * 3. Cloud API (optional, user-provided key)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@farm-visit/shared';
import { llmProvider } from '../lib/llm/LLMProvider';

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
    const userInput = input.trim();
    setInput('');
    setBusy(true);

    // Create assistant message placeholder
    const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
    setMessages((m) => [...m, assistantMsg]);

    try {
      console.log('[ChatDrawer] Sending message:', userInput);
      
      // Get visit context for location awareness
      const visitContext = (window as any).__VISIT_CONTEXT__;
      console.log('[ChatDrawer] Visit context:', visitContext);
      
      // Use unified LLM Provider with automatic fallback
      // Priority: Gemini Nano → Llama Local → Cloud API
      let hasResponse = false;
      const generator = llmProvider.stream({
        text: userInput,
        location: visitContext?.gps 
          ? { lat: visitContext.gps.lat, lon: visitContext.gps.lon }
          : undefined,
      });

      // Show which provider is being used
      const stats = llmProvider.getStats();
      console.log('[ChatDrawer] Using provider:', stats.provider);

      for await (const chunk of generator) {
        hasResponse = true;
        console.log('[ChatDrawer] Received chunk:', chunk);
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          if (last && last.role === 'assistant') {
            copy[copy.length - 1] = { ...last, content: last.content + chunk };
          }
          return copy;
        });
      }

      // If no response was generated, show a helpful fallback message
      if (!hasResponse) {
        console.warn('[ChatDrawer] No response generated from LLM provider');
        const stats = llmProvider.getStats();
        let fallbackMessage = "I'm here! How can I help you with your field visit?\n\n";
        
        if (stats.provider === 'none') {
          fallbackMessage += "Note: AI model is initializing. This may take a moment on first use.\n\n";
          fallbackMessage += "Available options:\n";
          fallbackMessage += "• Android 14+ with AICore → Gemini Nano\n";
          fallbackMessage += "• Any Android 7+ → Llama Local (download model)\n";
          fallbackMessage += "• Online → Cloud API (with API key)";
        }

        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          if (last && last.role === 'assistant') {
            copy[copy.length - 1] = { ...last, content: fallbackMessage };
          }
          return copy;
        });
      }
    } catch (err: any) {
      console.error('[ChatDrawer] Error:', err);
      
      // Provide helpful error messages based on provider failures
      let errorMessage = 'Sorry, I encountered an error. ';
      const stats = llmProvider.getStats();
      
      if (err.message?.includes('not available') || err.message?.includes('No LLM provider available')) {
        errorMessage += '\n\nAvailable options:\n';
        errorMessage += '• Android 14+ with AICore → Gemini Nano\n';
        errorMessage += '• Any Android 7+ → Llama Local (requires model download)\n';
        errorMessage += '• Online → Cloud API (requires API key configuration)';
      } else if (err.message?.includes('not initialized')) {
        errorMessage += 'The AI model is still initializing. Please try again in a moment.';
      } else if (err.message?.includes('timeout')) {
        errorMessage += 'The request timed out. Please check your connection and try again.';
      } else {
        errorMessage += err.message || 'Unknown error. Please try again.';
        if (stats.fallbackReason) {
          errorMessage += `\n\nDebug: ${stats.fallbackReason}`;
        }
      }
      
      setMessages((m) => {
        const copy = [...m];
        const last = copy[copy.length - 1];
        if (last && last.role === 'assistant') {
          copy[copy.length - 1] = { 
            ...last, 
            content: errorMessage
          };
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
