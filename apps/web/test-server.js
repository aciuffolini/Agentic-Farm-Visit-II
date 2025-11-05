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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
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

  // Visits endpoints (mock responses for testing)
  if (req.url === '/api/visits' && req.method === 'GET') {
    console.log('\n📋 GET /api/visits (mock response)');
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
        console.log('\n💾 POST /api/visits (mock save)');
        console.log('   Visit ID:', visit.id);
        console.log('   Field:', visit.field_id || 'N/A');
        
        // Mock successful save
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true,
          id: visit.id || 'mock-id-' + Date.now()
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

        console.log('\n📨 Chat Request Received');
        console.log('   Messages:', messages?.length || 0);
        console.log('   API Key:', apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : '❌ NOT PROVIDED');

        if (!apiKey) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: 'API key required',
            message: 'Set X-API-Key header with your OpenAI API key' 
          }));
          console.log('   ❌ Rejected: No API key\n');
          return;
        }

        // Validate API key format
        if (!apiKey.startsWith('sk-')) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: 'Invalid API key format',
            message: 'API key should start with "sk-"' 
          }));
          console.log('   ❌ Rejected: Invalid key format\n');
          return;
        }

        // Set SSE headers
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });

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
            console.log('   ❌ OpenAI Error:', openaiRes.status, errorText.substring(0, 100));
            res.write(`data: ${JSON.stringify({ error: errorText, status: openaiRes.status })}\n\n`);
            res.end();
            return;
          }

          console.log('   ✅ Streaming response...');

          // Stream response
          const reader = openaiRes.body.getReader();
          const decoder = new TextDecoder();
          let chunkCount = 0;

          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              res.write('data: [DONE]\n\n');
              res.end();
              console.log(`   ✅ Stream complete (${chunkCount} chunks)\n`);
              break;
            }
            chunkCount++;
            res.write(decoder.decode(value));
          }
        } catch (error) {
          console.log('   ❌ Server Error:', error.message);
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
          res.end();
        }
      } catch (error) {
        console.log('   ❌ Parse Error:', error.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
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

