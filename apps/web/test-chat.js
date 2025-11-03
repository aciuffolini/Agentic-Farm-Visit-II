/**
 * Direct chat test script
 * Run: node test-chat.js
 * Tests the chat endpoint directly (bypasses browser)
 */

const API_KEY = process.env.OPENAI_API_KEY || 'sk-proj-g4...'; // Replace with your key

async function testChat() {
  console.log('\n🧪 Testing Chat Endpoint Directly\n');
  console.log('='.repeat(50));
  
  try {
    console.log('\n1. Testing /api/chat endpoint...');
    console.log('   Server: http://localhost:3000');
    console.log('   API Key:', API_KEY.substring(0, 10) + '...');
    
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hello, this is a test message' }
        ],
      }),
    });
    
    console.log('\n2. Response Status:', response.status, response.statusText);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const text = await response.text();
      console.error('\n❌ Error Response:', text);
      return;
    }
    
    if (!response.body) {
      console.error('\n❌ No response body');
      return;
    }
    
    console.log('\n3. Streaming response...');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let chunkCount = 0;
    let fullText = '';
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        console.log(`\n✅ Stream complete (${chunkCount} chunks)`);
        console.log('   Total text length:', fullText.length);
        break;
      }
      
      chunkCount++;
      const text = decoder.decode(value);
      fullText += text;
      
      // Show first chunk and summary
      if (chunkCount === 1) {
        console.log('   First chunk:', text.substring(0, 200));
      }
    }
    
    console.log('\n✅ Chat test successful!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nPossible issues:');
    console.error('  1. Test server not running (node test-server.js)');
    console.error('  2. API key invalid');
    console.error('  3. Network error');
  }
  
  console.log('\n' + '='.repeat(50));
}

// Run test
testChat().catch(console.error);

