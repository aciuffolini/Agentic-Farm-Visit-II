/**
 * Chat Drawer Component
 * Uses unified LLM Provider with automatic fallback:
 * 1. Gemini Nano (Android 14+ with AICore)
 * 2. Llama Local (Android 7+, offline fallback)
 * 3. Cloud API (optional, user-provided key)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@farm-visit/shared';
import { llmProvider, ModelOption } from '../lib/llm/LLMProvider';
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
  const [selectedModel, setSelectedModel] = useState<ModelOption>('auto');
  
  // Initial message with API key prompt if needed
  const initialMessage = useMemo(() => {
    const hasKey = getUserApiKey();
    if (!hasKey && navigator.onLine) {
      return {
        role: 'assistant' as const,
        content: '👋 Hi! I can help you with field visit information.\n\n⚠️ **To use Cloud API fallback**, please set your API key:\n\n1. Click **🔑 Set API Key** button above\n2. Enter your API key\n3. Start chatting!\n\n*(If you have Android 14+ with AICore, Gemini Nano will work automatically)*'
      };
    }
    return {
      role: 'assistant' as const,
      content: 'Hi! I can help you with field visit information. Ask me anything!'
    };
  }, []);
  
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  
  // Refresh API key state when drawer opens
  useEffect(() => {
    if (open) {
      const currentKey = getUserApiKey();
      setApiKey(currentKey);
      if (!currentKey && navigator.onLine) {
        // Auto-show API key input if online and no key
        setTimeout(() => {
          setShowApiKeyInput(true);
        }, 1000);
      }
    }
  }, [open]);

  const handleApiKeySave = () => {
    setUserApiKey(apiKey);
    setShowApiKeyInput(false);
    if (apiKey) {
      setMessages((m) => [...m, { 
        role: 'assistant', 
        content: '✅ API key saved! You can now use Cloud API fallback.' 
      }]);
    } else {
      setMessages((m) => [...m, { 
        role: 'assistant', 
        content: 'API key cleared. Server will use default key if configured.' 
      }]);
    }
  };

  const send = async () => {
    if (!input.trim() || busy) return;

    // Check if server is running (for Cloud API models)
    if (selectedModel === 'gpt-4o-mini' || selectedModel === 'claude-code' || selectedModel === 'auto') {
      const isServerRunning = await checkServerHealth();
      if (!isServerRunning && navigator.onLine) {
        const hasKey = getUserApiKey();
        if (hasKey) {
          // Server not running but user has API key
          setMessages((m) => [...m, { 
            role: 'assistant', 
            content: '⚠️ **Test Server Not Running**\n\n' +
                     'The API server needs to be running for Cloud API models.\n\n' +
                     '**Quick Fix:**\n' +
                     '1. Open a new terminal/command prompt\n' +
                     '2. Navigate to: `apps/web` folder\n' +
                     '3. Run: `node test-server.js`\n' +
                     '4. Wait for: "✅ Test Server Running"\n' +
                     '5. Try chatting again!\n\n' +
                     '**Or use the script:**\n' +
                     '- Double-click: `apps/web/start-both.bat`\n' +
                     '- This starts both dev server and test server\n\n' +
                     '**Verify server is running:**\n' +
                     '- Open: http://localhost:3000/health\n' +
                     '- Should show: `{"ok":true,"message":"Test server running"}`'
          }]);
          return;
        }
      }
    }

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
      
      // Get structured visit context
      const visitContext = (window as any).__VISIT_CONTEXT__;
      console.log('[ChatDrawer] Visit context:', visitContext);
      
      // Build structured visit data for prompt context
      const structuredVisit = visitContext ? {
        current: {
          gps: visitContext.gps ? {
            lat: visitContext.gps.lat,
            lon: visitContext.gps.lon,
            accuracy: visitContext.gps.acc,
          } : null,
          note: visitContext.note || null,
          photo: visitContext.photo?.url || null,
          audio: visitContext.audio?.url || null,
        },
        latest: visitContext.latestVisit ? {
          id: visitContext.latestVisit.id,
          field_id: visitContext.latestVisit.field_id,
          crop: visitContext.latestVisit.crop,
          issue: visitContext.latestVisit.issue,
          severity: visitContext.latestVisit.severity,
          photo_url: visitContext.latestVisit.photo_url,
          audio_url: visitContext.latestVisit.audio_url,
        } : null,
      } : null;
      
      // Use unified LLM Provider with automatic fallback or explicit model selection
      // Priority: Gemini Nano (offline) → Llama Local (offline) → Cloud API (online)
      // Or use selected model if user chose one
      let hasResponse = false;
      const generator = llmProvider.stream({
        text: userInput,
        location: visitContext?.gps 
          ? { lat: visitContext.gps.lat, lon: visitContext.gps.lon }
          : undefined,
        model: selectedModel, // Pass selected model (or 'auto' for fallback)
        visitContext: structuredVisit, // Pass structured visit data
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
          // Check if we're online and have API key
          const hasKey = getUserApiKey();
          const isOnline = navigator.onLine;
          
          if (!isOnline) {
            fallbackMessage += "⚠️ **Device is offline**\n\n";
            fallbackMessage += "Available offline options:\n";
            fallbackMessage += "• Android 14+ with AICore → Gemini Nano\n";
            fallbackMessage += "• Any Android 7+ → Llama Local (download model)\n\n";
            fallbackMessage += "**Note**: Cloud API requires internet connection.";
          } else if (!hasKey) {
            fallbackMessage += "⚠️ **API key not configured**\n\n";
            fallbackMessage += "To use Cloud API:\n";
            fallbackMessage += "1. Click **🔑 Set API Key** button above\n";
            fallbackMessage += "2. Enter your OpenAI or Anthropic API key\n";
            fallbackMessage += "3. Start chatting!\n\n";
            fallbackMessage += "**Alternative**: Use offline models on Android devices.";
          } else {
            // Online with key but still failed - might be server issue
            fallbackMessage += "⚠️ **Connection issue**\n\n";
            fallbackMessage += "The API server might not be running.\n\n";
            fallbackMessage += "**For local development:**\n";
            fallbackMessage += "1. Start the test server: `node apps/web/test-server.js`\n";
            fallbackMessage += "2. Or use the script: `apps/web/start-both.bat`\n\n";
            fallbackMessage += "**For production:** Check if the API endpoint is accessible.";
          }
        } else {
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
      const hasApiKey = getUserApiKey();
      
      // Check if it's a server connection error (ECONNREFUSED, Cannot connect to server)
      if (err.message?.includes('ECONNREFUSED') || 
          err.message?.includes('Cannot connect to server') ||
          err.message?.includes('Connection refused') ||
          err.message?.includes('connect ECONNREFUSED') ||
          err.message?.includes('Failed to fetch') ||
          (err.message?.includes('fetch') && err.message?.includes('ERR_CONNECTION_REFUSED'))) {
        errorMessage = '⚠️ **Server Connection Error**\n\n';
        errorMessage += 'Cannot connect to the test server. Please check:\n\n';
        errorMessage += '1. **Is the server running?**\n';
        errorMessage += '   Run: `node test-server.js` in a separate terminal\n';
        errorMessage += '   Expected output: "✅ Test Server Running"\n\n';
        errorMessage += '2. **Verify server is working:**\n';
        errorMessage += '   Open: http://localhost:3000/health\n';
        errorMessage += '   Should return: `{"ok":true,"message":"Test server running"}`\n\n';
        errorMessage += '3. **Set your API key** using the 🔑 button above\n';
        errorMessage += '4. **Try again** after the server is running\n\n';
        
        // Automatically show API key input if not shown
        if (!showApiKeyInput) {
          setTimeout(() => setShowApiKeyInput(true), 500);
        }
      } 
      // Check if it's a Cloud API authentication error
      else if (err.message?.includes('401') || err.message?.includes('unauthorized') || 
          (err.message?.includes('Cloud API') && !hasApiKey && navigator.onLine)) {
        errorMessage = '⚠️ **API Key Required for Cloud API**\n\n';
        errorMessage += 'To use Cloud API fallback, you need to set an API key:\n\n';
        errorMessage += '1. Click the **🔑 Set API Key** button above\n';
        errorMessage += '2. Enter your API key (stored locally)\n';
        errorMessage += '3. Try again\n\n';
        errorMessage += 'Or ensure your server has a default API key configured.';
        
        // Automatically show API key input if not shown
        if (!showApiKeyInput) {
          setTimeout(() => setShowApiKeyInput(true), 500);
        }
      } 
      // Check if server returned 503 (server unavailable response from proxy)
      else if (err.message?.includes('503') || err.message?.includes('API server unavailable') || 
               err.message?.includes('Test server is not running')) {
        errorMessage = '⚠️ **Test Server Not Running**\n\n';
        errorMessage += 'The proxy indicates the server is not available.\n\n';
        errorMessage += '**Quick Check:**\n';
        errorMessage += '1. Open: http://localhost:3000/health\n';
        errorMessage += '2. If you see `{"ok":true}`, server IS running\n';
        errorMessage += '3. If connection fails, start server: `node test-server.js`\n\n';
        errorMessage += '**To start server:**\n';
        errorMessage += '```bash\n';
        errorMessage += 'cd apps/web\n';
        errorMessage += 'node test-server.js\n';
        errorMessage += '```\n';
      }
      // Check if it's a server endpoint not found error
      else if (err.message?.includes('404') || err.message?.includes('Server endpoint not found')) {
        errorMessage = '⚠️ **Server Endpoint Not Found**\n\n';
        errorMessage += 'The server is running but the endpoint is not available.\n\n';
        errorMessage += '**Diagnosis:**\n';
        errorMessage += '1. Server is running (not a connection issue)\n';
        errorMessage += '2. But `/api/chat` endpoint not found\n\n';
        errorMessage += '**Check:**\n';
        errorMessage += '- Server console for errors\n';
        errorMessage += '- Test: http://localhost:3000/api/chat (should return JSON)\n\n';
      }
      // Check if server returned 500 (server error)
      else if (err.message?.includes('500') || err.message?.includes('Internal Server Error')) {
        errorMessage = '⚠️ **Server Error**\n\n';
        errorMessage += 'The server returned an error. This might be:\n\n';
        errorMessage += '1. **API key issue** - Check if your API key is valid\n';
        errorMessage += '2. **OpenAI API error** - Check server console for details\n';
        errorMessage += '3. **Server configuration** - Check server logs\n\n';
        errorMessage += '**Quick fix:**\n';
        errorMessage += '- Check server console for error details\n';
        errorMessage += '- Verify API key is correct (if using custom key)\n';
      }
      // Check if it's a timeout error
      else if (err.message?.includes('timeout') || err.message?.includes('Request timeout')) {
        errorMessage = '⚠️ **Connection Timeout**\n\n';
        errorMessage += 'The server is taking too long to respond.\n\n';
        errorMessage += 'Possible causes:\n';
        errorMessage += '1. Server is slow or overloaded\n';
        errorMessage += '2. Network connection is slow\n';
        errorMessage += '3. Server might be unreachable\n\n';
        errorMessage += 'Try again in a moment or check if the server is running.';
      }
      // Check if no providers are available
      else if (err.message?.includes('not available') || err.message?.includes('No LLM provider available')) {
        errorMessage += '\n\n**Available options:**\n';
        errorMessage += '• Android 14+ with AICore → Gemini Nano\n';
        errorMessage += '• Any Android 7+ → Llama Local (requires model download)\n';
        errorMessage += '• Online → Cloud API (requires API key + server)\n\n';
        
        // Check if server might be running (for web users)
        if (navigator.onLine) {
          if (!hasApiKey) {
            errorMessage += '💡 **To use Cloud API:**\n';
            errorMessage += '   1. Click **🔑 Set API Key** above\n';
            errorMessage += '   2. Enter your API key\n';
            errorMessage += '   3. Make sure test server is running: `node test-server.js`\n\n';
          } else {
            errorMessage += '💡 **You have an API key set.** Make sure the test server is running:\n';
            errorMessage += '   Run: `node test-server.js` in a separate terminal\n';
            errorMessage += '   Then verify: http://localhost:3000/health\n\n';
          }
        }
      } 
      // Check if model is initializing
      else if (err.message?.includes('not initialized')) {
        errorMessage += 'The AI model is still initializing. Please try again in a moment.';
      } 
      // Generic error
      else {
        errorMessage += err.message || 'Unknown error. Please try again.';
        if (stats.fallbackReason) {
          errorMessage += `\n\nDebug: ${stats.fallbackReason}`;
        }
        // Add helpful hint for connection errors
        if (err.message?.includes('fetch') || err.message?.includes('network')) {
          errorMessage += '\n\n💡 **Hint:** Make sure the test server is running: `node test-server.js`';
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
          <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 bg-slate-50">
            <div className="font-semibold">AI Assistant</div>
            <div className="flex items-center gap-2">
              {/* Model Selection */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ModelOption)}
                className="text-xs font-medium px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="Select AI model"
              >
                <option value="auto">🤖 Auto (Best Available)</option>
                <option value="nano">📱 Nano (Offline)</option>
                <option value="gpt-4o-mini">☁️ ChatGPT 4o mini</option>
                <option value="claude-code">🤖 Claude Code</option>
                <option value="llama-small">🦙 Llama Small (Offline)</option>
              </select>
              <button 
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition ${
                  getUserApiKey() 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100' 
                    : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                }`}
                title={getUserApiKey() ? 'API key configured ✓ - Click to view/edit' : '⚠️ Set API key for Cloud API - Required for online chat'}
              >
                {getUserApiKey() ? '🔑 API Key Set ✓' : '🔑 Set API Key'}
              </button>
              <button onClick={onClose} className="text-slate-500 text-sm hover:text-slate-700">
                Close
              </button>
            </div>
          </div>

          {/* API Key Input - More Prominent */}
          {showApiKeyInput && (
            <div className="px-4 py-4 border-b-2 border-amber-200 bg-amber-50">
              <div className="mb-2">
                <div className="text-sm font-semibold text-amber-900 mb-1">
                  🔑 API Key Required for Cloud API
                </div>
                <p className="text-xs text-amber-700 mb-2">
                  Enter your API key to use Cloud API fallback. Key is stored locally on this device and never shared.
                </p>
                <div className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded border border-amber-200">
                  💡 <strong>Tip:</strong> Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-800">OpenAI Platform</a> or <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-800">Groq Console</a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-... or sk-... (Enter your API key)"
                  className="flex-1 text-sm px-3 py-2 rounded-lg border-2 border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApiKeySave();
                    } else if (e.key === 'Escape') {
                      setShowApiKeyInput(false);
                      setApiKey(getUserApiKey());
                    }
                  }}
                  title="Enter your API key. Press Enter to save, Esc to cancel."
                  autoFocus
                />
                <button
                  onClick={handleApiKeySave}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Save API key (stored locally on this device)"
                  disabled={!apiKey.trim()}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowApiKeyInput(false);
                    setApiKey(getUserApiKey());
                  }}
                  className="px-3 py-2 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 text-amber-700 transition-colors"
                  title="Cancel and close API key input"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

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
                placeholder="Ask AI about your field visit... (Press Enter to send)"
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                disabled={busy}
                title="Type your message and press Enter to send"
              />
              <button
                disabled={busy || !input.trim()}
                onClick={send}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:shadow hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title={busy ? "Sending message..." : !input.trim() ? "Enter a message first" : "Send message (or press Enter)"}
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
