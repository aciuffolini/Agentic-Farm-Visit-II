/**
 * Quick test script to verify all API endpoints
 * Run: node test-api-endpoints.js
 */

const BASE = 'http://localhost:3000';

async function testEndpoint(method, url, body = null, headers = {}) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE}${url}`, options);
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    console.log(`${method} ${url}: ${response.status} ${response.statusText}`);
    if (response.ok) {
      console.log('  ✅ Success:', JSON.stringify(data).substring(0, 100));
    } else {
      console.log('  ❌ Error:', JSON.stringify(data).substring(0, 100));
    }
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.log(`${method} ${url}: ❌ Failed - ${error.message}`);
    return { ok: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n🧪 Testing API Endpoints\n');
  console.log('='.repeat(50));
  
  // Test 1: Health check
  console.log('\n1. Health Check');
  await testEndpoint('GET', '/health');
  
  // Test 2: Visits GET
  console.log('\n2. Visits GET');
  await testEndpoint('GET', '/api/visits');
  
  // Test 3: Visits POST
  console.log('\n3. Visits POST');
  await testEndpoint('POST', '/api/visits', {
    id: 'test-id',
    ts: Date.now(),
    field_id: 'test-field',
    note: 'Test visit',
  });
  
  // Test 4: Chat POST (without API key - should fail)
  console.log('\n4. Chat POST (no API key - should fail)');
  await testEndpoint('POST', '/api/chat', {
    messages: [{ role: 'user', content: 'test' }],
  });
  
  // Test 5: Chat POST (with API key - if you have one)
  console.log('\n5. Chat POST (with API key)');
  const apiKey = process.env.OPENAI_API_KEY || 'sk-test-key';
  await testEndpoint('POST', '/api/chat', {
    messages: [{ role: 'user', content: 'Hello' }],
  }, {
    'X-API-Key': apiKey,
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Tests complete!\n');
}

runTests().catch(console.error);

