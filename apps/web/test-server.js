/**
 * Minimal Test Server for Local Testing
 * Proxies /api/chat requests to OpenAI with user API key
 * 
 * Run: node test-server.js
 */

import http from 'http';

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  // CORS headers (properly configured to avoid browser warnings)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-Provider, X-Model');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (req.url === '/health' || req.url === '/api/health') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true, message: 'Test server running' }));
    return;
  }

  // Visits endpoints (simple storage - in production, connect to database)
  if (req.url === '/api/visits' && req.method === 'GET') {
    console.log('\n📋 GET /api/visits');
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ 
      visits: [],
      total: 0,
      hasMore: false
    }));
    return;
  }

  if (req.url === '/api/visits' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const visit = JSON.parse(body);
        console.log('\n💾 POST /api/visits');
        console.log('   Visit ID:', visit.id);
        console.log('   Field:', visit.field_id || 'N/A');
        
        // In production, save to database here
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true,
          id: visit.id || 'visit-' + Date.now()
        }));
      } catch (error) {
        console.log('   ❌ Parse Error:', error.message);
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(400);
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // Chat endpoint
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        // Log all headers for debugging
        console.log('\n📨 Incoming Request:');
        console.log('   URL:', req.url);
        console.log('   Method:', req.method);
        console.log('   Headers:', JSON.stringify(req.headers, null, 2));
        
        const parsed = JSON.parse(body);
        const { messages } = parsed;
        const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
        const provider = req.headers['x-provider'] || req.headers['X-Provider'] || 'openai';

        console.log('\n📨 Chat Request Received');
        console.log('   Messages:', messages?.length || 0);
        console.log('   Provider:', provider);
        console.log('   API Key:', apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : '❌ NOT PROVIDED');

        if (!apiKey) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: 'API key required',
            message: `Set X-API-Key header with your ${provider === 'claude-code' ? 'Anthropic' : 'OpenAI'} API key` 
          }));
          console.log('   ❌ Rejected: No API key\n');
          return;
        }

        // Validate API key format based on provider
        if (provider === 'claude-code') {
          // Anthropic API keys start with 'sk-ant-'
          if (!apiKey.startsWith('sk-ant-')) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: 'Invalid API key format',
              message: 'Anthropic API key should start with "sk-ant-"' 
            }));
            console.log('   ❌ Rejected: Invalid Anthropic key format\n');
            return;
          }
        } else {
          // OpenAI API keys start with 'sk-'
          if (!apiKey.startsWith('sk-')) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: 'Invalid API key format',
              message: 'OpenAI API key should start with "sk-"' 
            }));
            console.log('   ❌ Rejected: Invalid OpenAI key format\n');
            return;
          }
        }

        // Set SSE headers
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });

        // Route to appropriate provider
        if (provider === 'claude-code') {
          console.log('   ✅ Calling Anthropic API...');
          
          try {
            // Anthropic API format
            const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022', // Claude Code model
                max_tokens: 4096,
                messages: messages,
                stream: true,
              }),
            });

            if (!anthropicRes.ok) {
              const errorText = await anthropicRes.text();
              console.log('   ❌ Anthropic Error:', anthropicRes.status, errorText.substring(0, 100));
              res.write(`data: ${JSON.stringify({ error: errorText, status: anthropicRes.status })}\n\n`);
              res.end();
              return;
            }

            console.log('   ✅ Streaming response...');

            // Stream Anthropic response (SSE format)
            const reader = anthropicRes.body.getReader();
            const decoder = new TextDecoder();
            let chunkCount = 0;
            let buffer = '';

            try {
              while (true) {
                const { value, done } = await reader.read();
                if (done) {
                  // Flush any remaining buffer
                  if (buffer.trim()) {
                    const lines = buffer.split(/\r?\n/);
                    for (const line of lines) {
                      if (line.startsWith('data: ')) {
                        res.write(line + '\n');
                      }
                    }
                  }
                  res.write('data: [DONE]\n\n');
                  res.end();
                  console.log(`   ✅ Stream complete (${chunkCount} chunks)\n`);
                  break;
                }
                
                chunkCount++;
                buffer += decoder.decode(value, { stream: true });
                
                // Process complete SSE lines
                const lines = buffer.split(/\r?\n/);
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') {
                      res.write('data: [DONE]\n\n');
                      res.end();
                      console.log(`   ✅ Stream complete (${chunkCount} chunks)\n`);
                      return;
                    }
                    
                    try {
                      const parsed = JSON.parse(data);
                      // Anthropic SSE format: { type: 'content_block_delta', delta: { text: "..." } }
                      if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                        // Convert to OpenAI-compatible format for frontend
                        const openaiFormat = JSON.stringify({
                          choices: [{
                            delta: {
                              content: parsed.delta.text
                            }
                          }]
                        });
                        res.write(`data: ${openaiFormat}\n\n`);
                      }
                    } catch (e) {
                      // Skip invalid JSON lines (comments, etc.)
                      if (data && !data.startsWith(':')) {
                        console.warn('   ⚠️ Skipping invalid JSON line:', data.substring(0, 50));
                      }
                    }
                  } else if (line.trim() && !line.startsWith(':')) {
                    // Forward non-comment lines
                    res.write(line + '\n');
                  }
                }
              }
            } catch (streamError) {
              console.log('   ❌ Anthropic Stream Error:', streamError.message);
              if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  error: 'Stream error',
                  message: streamError.message
                }));
              } else {
                res.write(`data: ${JSON.stringify({ error: streamError.message, type: 'error' })}\n\n`);
                res.end();
              }
            }
          } catch (error) {
            console.log('   ❌ Anthropic API Error:', error.message);
            console.log('   Stack:', error.stack);
            
            // If headers not sent yet, send proper error response
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                error: 'Anthropic API error',
                message: error.message,
                hint: 'Check your API key and Anthropic account status'
              }));
            } else {
              // Headers already sent (SSE started), send error in stream
              res.write(`data: ${JSON.stringify({ error: error.message, type: 'error' })}\n\n`);
              res.end();
            }
            return;
          }
          return;
        }

        // Default: OpenAI
        console.log('   ✅ Calling OpenAI API...');

        // Call OpenAI
        try {
          // Use messages as-is - LLMProvider already includes enhanced system prompt with visit context
          // If messages don't have a system message, add a basic one (fallback)
          const hasSystemMessage = messages.some(m => m.role === 'system');
          const messagesWithSystem = hasSystemMessage 
            ? messages 
            : [
                {
                  role: 'system',
                  content: `You are a helpful agricultural field visit assistant. You help farmers and agricultural professionals with:

• Field visit data capture and organization
• Crop identification and management advice
• Pest and disease detection and treatment recommendations
• Agricultural best practices and field management
• GPS location-based agricultural insights

Be concise, practical, and provide actionable advice. Use the visit context provided (GPS location, notes, photos, audio recordings, saved visit records) to give specific, relevant responses.

Respond in a friendly, professional manner suitable for field work.`
                },
                ...messages
              ];
          
          // Log system message content for debugging (first 200 chars)
          if (hasSystemMessage) {
            const systemMsg = messages.find(m => m.role === 'system');
            console.log('   📝 System message (with context):', systemMsg?.content?.substring(0, 200) + '...');
          }

          // Check for vision content (images in content arrays)
          const userMsg = messagesWithSystem.find((m) => m.role === 'user');
          const hasVision = userMsg && Array.isArray(userMsg.content);
          if (hasVision) {
            const imageCount = userMsg.content.filter((item) => item.type === 'image_url').length;
            console.log('   📷 Vision content detected:', imageCount, 'image(s) in user message');
            console.log('   📷 User message content type:', typeof userMsg.content, Array.isArray(userMsg.content) ? '(array format)' : '(string)');
          }

          const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: messagesWithSystem,
              stream: true,
            }),
          });

          if (!openaiRes.ok) {
            const errorText = await openaiRes.text();
            console.log('   ❌ OpenAI Error:', openaiRes.status, errorText.substring(0, 200));
            
            // Send proper error response (not in SSE format since we haven't started streaming)
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                error: 'OpenAI API error',
                message: errorText,
                status: openaiRes.status,
                hint: 'Check your API key and OpenAI account status'
              }));
            } else {
              // Headers already sent, send error in stream
              res.write(`data: ${JSON.stringify({ error: errorText, status: openaiRes.status, type: 'error' })}\n\n`);
              res.end();
            }
            return;
          }

          console.log('   ✅ Streaming response...');

          // DIRECT PASSTHROUGH - No manipulation, just forward bytes
          const reader = openaiRes.body.getReader();
          const decoder = new TextDecoder();
          let chunkCount = 0;

          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) {
                // Final flush
                try {
                  const finalDecoded = decoder.decode();
                  if (finalDecoded) {
                    res.write(finalDecoded);
                  }
                } catch (e) {
                  // Ignore
                }
                res.write('data: [DONE]\n\n');
                res.end();
                console.log(`   ✅ Stream complete (${chunkCount} chunks)\n`);
                break;
              }
              
              chunkCount++;
              // Decode and write - OpenAI already sends proper SSE format
              const decoded = decoder.decode(value, { stream: true });
              res.write(decoded);
            }
          } catch (streamError) {
            console.log('   ❌ Stream Error:', streamError.message);
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                error: 'Stream error',
                message: streamError.message
              }));
            } else {
              res.write(`data: ${JSON.stringify({ error: streamError.message, type: 'error' })}\n\n`);
              res.end();
            }
          }
        } catch (error) {
          console.log('   ❌ OpenAI API Error:', error.message);
          console.log('   Stack:', error.stack);
          
          // If headers not sent yet, send proper error response
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: 'OpenAI API error',
              message: error.message,
              hint: 'Check your API key and OpenAI account status'
            }));
          } else {
            // Headers already sent (SSE started), send error in stream
            res.write(`data: ${JSON.stringify({ error: error.message, type: 'error' })}\n\n`);
            res.end();
          }
        }
      } catch (error) {
        console.log('   ❌ Parse Error:', error.message);
        console.log('   Stack:', error.stack);
        if (!res.headersSent) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Parse error', message: error.message }));
        }
      }
    });
    
    // Handle request errors
    req.on('error', (error) => {
      console.log('   ❌ Request Error:', error.message);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request error', message: error.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', path: req.url }));
  }
});

// Listen on localhost explicitly to ensure proper interface binding
server.listen(PORT, 'localhost', () => {
  console.log(`\n✅ Test Server Running`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
  console.log('📡 Ready to receive requests...\n');
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use`);
    console.error('   Solution: Kill the process using port 3000 or change PORT in this file\n');
    process.exit(1);
  } else {
    console.error(`\n❌ Server error: ${err.message}\n`);
    process.exit(1);
  }
});

