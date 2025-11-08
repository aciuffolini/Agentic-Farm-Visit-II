/**
 * NON-STREAMING TEST SERVER
 * Returns complete response instead of streaming
 * Use this to test if API connection works
 */

import http from 'http';

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-Provider, X-Model');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (req.url === '/health' || req.url === '/api/health') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true, message: 'Test server running (non-streaming mode)' }));
    return;
  }

  // Chat endpoint - NON-STREAMING VERSION
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body);
        const { messages } = parsed;
        const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
        const provider = req.headers['x-provider'] || req.headers['X-Provider'] || 'openai';

        console.log('\n📨 Chat Request (Non-Streaming)');
        console.log('   Messages:', messages?.length || 0);
        console.log('   Provider:', provider);
        console.log('   API Key:', apiKey ? 'SET' : 'NOT SET');

        if (!apiKey) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'API key required' }));
          return;
        }

        // Call OpenAI API - NO STREAMING
        try {
          console.log('   ✅ Calling OpenAI API (non-streaming)...');
          
          const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: messages,
              stream: false, // NO STREAMING
            }),
          });

          if (!openaiRes.ok) {
            const errorText = await openaiRes.text();
            console.log('   ❌ OpenAI Error:', openaiRes.status, errorText.substring(0, 200));
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: 'OpenAI API error',
              message: errorText,
              status: openaiRes.status
            }));
            return;
          }

          // Get complete response
          const openaiData = await openaiRes.json();
          console.log('   ✅ Got complete response from OpenAI');
          
          // Extract text
          const content = openaiData.choices?.[0]?.message?.content || '';
          console.log('   📝 Response length:', content.length);

          // Send as SSE format (but complete)
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          });

          // Send complete response as single chunk
          const sseData = JSON.stringify({
            choices: [{
              delta: { content: content }
            }]
          });
          res.write(`data: ${sseData}\n\n`);
          res.write('data: [DONE]\n\n');
          res.end();
          
          console.log('   ✅ Response sent\n');
        } catch (error) {
          console.log('   ❌ Error:', error.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: 'Server error',
            message: error.message
          }));
        }
      } catch (error) {
        console.log('   ❌ Parse Error:', error.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, 'localhost', () => {
  console.log(`\n✅ Non-Streaming Test Server Running`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Mode: NON-STREAMING (complete responses)`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
  console.log('📡 Ready to receive requests...\n');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use\n`);
    process.exit(1);
  }
});

