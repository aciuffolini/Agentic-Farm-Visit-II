/**
 * Chat Drawer Component
 * Simplified - uses only Gemini Nano for now
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@farm-visit/shared';
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

    // Create assistant message placeholder
    const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
    setMessages((m) => [...m, assistantMsg]);

    try {
      // Use Gemini Nano only (will be tuned in future)
      const visitContext = (window as any).__VISIT_CONTEXT__;
      
      // Stream response from Gemini Nano
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
    } catch (err: any) {
      setMessages((m) => {
        const copy = [...m];
        const last = copy[copy.length - 1];
        if (last && last.role === 'assistant') {
          copy[copy.length - 1] = { 
            ...last, 
            content: `Sorry, I encountered an error. Please try again. (${err.message || 'Unknown error'})`
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
            <div className="font-semibold">AI Assistant (Gemini Nano)</div>
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
