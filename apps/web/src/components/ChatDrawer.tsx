/**
 * Chat Drawer Component - HYBRID VERSION
 * Uses LLMService for online/offline inference
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@farm-visit/shared';
import { llmService } from '../lib/llm/service';
import { getUserApiKey, setUserApiKey } from '../lib/config/userKey';

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState(getUserApiKey());

  const initialMessage = useMemo(() => {
    return {
      role: 'assistant' as const,
      content: 'Hi! Ask me anything about your field visit. An internet connection and an API key are required.',
    };
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);

  useEffect(() => {
    if (open) {
      const currentKey = getUserApiKey();
      setApiKey(currentKey);
    }
  }, [open]);

  const handleApiKeySave = () => {
    setUserApiKey(apiKey);
    setShowApiKeyInput(false);
    if (apiKey) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: '✅ API key saved! You can now chat.',
        },
      ]);
    }
  };

  const send = async () => {
    if (!input.trim() || busy) return;

    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    const userInput = input.trim();
    setInput('');
    setBusy(true);

    const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
    setMessages((m) => [...m, assistantMsg]);

    try {
      const generator = llmService.chat([{ role: 'user', content: userInput }]);

      for await (const { token, source } of generator) {
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          if (last && last.role === 'assistant') {
            copy[copy.length - 1] = {
              ...last,
              content: last.content + token,
              source: source,
            };
          }
          return copy;
        });
      }
    } catch (err: any) {
      console.error('[ChatDrawer] Error:', err);
      const errMsg = err.message || String(err);
      const errorMessage = `❌ Error: ${errMsg}`;
      setMessages((m) => {
        const copy = [...m];
        const last = copy[copy.length - 1];
        if (last && last.role === 'assistant') {
          copy[copy.length - 1] = { ...last, content: errorMessage };
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
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            <div className="border-b border-slate-200 p-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">AI Chat</h2>
              <div className="flex items-center gap-2">
                {showApiKeyInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="API Key"
                      className="text-xs px-2 py-1 border rounded"
                    />
                    <button
                      onClick={handleApiKeySave}
                      className="text-xs px-2 py-1 bg-emerald-500 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowApiKeyInput(false)}
                      className="text-xs px-2 py-1 border rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowApiKeyInput(true)}
                    className="text-xs px-2 py-1 border rounded"
                    title="Set API Key"
                  >
                    🔑
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 p-3 space-y-2 overflow-auto">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      m.role === 'user'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                  </div>
                </div>
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
                  placeholder="Type your message..."
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={busy}
                />
                <button
                  disabled={busy || !input.trim()}
                  onClick={send}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  {busy ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
