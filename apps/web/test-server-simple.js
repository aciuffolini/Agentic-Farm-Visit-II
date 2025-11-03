/**
 * SIMPLIFIED Test Server - Just handles basic endpoints
 * Good for testing if main server has issues
 */

import http from 'http';

const PORT = 3000;
const visits = []; // In-memory store for testing

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${req.method} ${req.url}`);

  // Health
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // Visits - GET
  if (req.url === '/api/visits' && req.method === 'GET') {
    const params = new URL(req.url, `http://${req.headers.host}`).searchParams;
    const limit = parseInt(params.get('limit') || '10');
    const offset = parseInt(params.get('offset') || '0');
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      visits: visits.slice(offset, offset + limit),
      total: visits.length,
      hasMore: offset + limit < visits.length
    }));
    return;
  }

  // Visits - POST
  if (req.url === '/api/visits' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const visit = JSON.parse(body);
        visits.push(visit);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, id: visit.id }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // Chat - POST
  if (req.url === '/api/chat' && req.method === 'POST') {
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
    
    if (!apiKey) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API key required' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { messages } = JSON.parse(body);

        // Set SSE headers
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });

        // Call OpenAI
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            stream: true,
          }),
        });

        if (!openaiRes.ok) {
          const errorText = await openaiRes.text();
          res.write(`data: ${JSON.stringify({ error: errorText })}\n\n`);
          res.end();
          return;
        }

        // Stream response
        const reader = openaiRes.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            res.write('data: [DONE]\n\n');
            res.end();
            break;
          }
          res.write(decoder.decode(value));
        }
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found', path: req.url }));
});

server.listen(PORT, () => {
  console.log(`\n✅ Simple Test Server Running`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`\n📡 Endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /api/visits`);
  console.log(`   POST /api/visits`);
  console.log(`   POST /api/chat\n`);
});

