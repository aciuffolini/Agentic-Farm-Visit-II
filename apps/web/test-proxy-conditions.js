/**
 * Proxy Error Diagnostic Tool
 * Tests the 4 most probable conditions that cause ECONNREFUSED errors
 */

import http from 'http';
import net from 'net';

const PORT = 3000;
const PROXY_TARGET = `http://localhost:${PORT}`;

console.log('🔍 Testing 4 Most Probable Conditions for Proxy Errors\n');
console.log('='.repeat(60));

// Condition 1: Test Server Not Running
async function testCondition1() {
  console.log('\n📋 Condition 1: Test Server Not Running');
  console.log('-'.repeat(60));
  
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}/health`, { timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ PASS: Test server IS running');
          try {
            const json = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(json)}`);
          } catch {
            console.log(`   Response: ${data}`);
          }
          resolve(true);
        } else {
          console.log(`❌ FAIL: Test server responded with status ${res.statusCode}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.log('❌ FAIL: Test server is NOT running (ECONNREFUSED)');
        console.log('   Solution: Run `node test-server.js` in a separate terminal');
        resolve(false);
      } else if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
        console.log('❌ FAIL: Connection timeout (server might be hanging)');
        resolve(false);
      } else {
        console.log(`❌ FAIL: Unexpected error: ${err.message} (${err.code})`);
        resolve(false);
      }
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('❌ FAIL: Connection timeout');
      resolve(false);
    });
  });
}

// Condition 2: Port Already in Use (Conflict)
async function testCondition2() {
  console.log('\n📋 Condition 2: Port Conflict (3000 already in use)');
  console.log('-'.repeat(60));
  
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log('❌ FAIL: Port 3000 is already in use by another process');
        console.log('   Solution: Kill the process using port 3000 or use a different port');
        resolve(false);
      } else {
        console.log(`❌ FAIL: Unexpected error: ${err.message}`);
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      console.log('✅ PASS: Port 3000 is available');
      server.close(() => resolve(true));
    });
    
    server.listen(PORT);
  });
}

// Condition 3: Network/Firewall Blocking
async function testCondition3() {
  console.log('\n📋 Condition 3: Network/Firewall Blocking Connection');
  console.log('-'.repeat(60));
  
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let connectionSuccess = false;
    
    const timeout = setTimeout(() => {
      if (!connectionSuccess) {
        socket.destroy();
        console.log('❌ FAIL: Connection timeout (firewall might be blocking)');
        console.log('   Solution: Check Windows Firewall or antivirus settings');
        resolve(false);
      }
    }, 3000);
    
    socket.on('connect', () => {
      connectionSuccess = true;
      clearTimeout(timeout);
      socket.destroy();
      console.log('✅ PASS: Network connection successful');
      resolve(true);
    });
    
    socket.on('error', (err) => {
      clearTimeout(timeout);
      if (err.code === 'ECONNREFUSED') {
        // This is actually Condition 1 (server not running)
        console.log('⚠️  SKIP: Server not running (covered in Condition 1)');
        resolve(null); // Skip this test
      } else if (err.code === 'ETIMEDOUT') {
        console.log('❌ FAIL: Connection timeout (firewall blocking)');
        console.log('   Solution: Check Windows Firewall or antivirus');
        resolve(false);
      } else {
        console.log(`❌ FAIL: Network error: ${err.code}`);
        resolve(false);
      }
    });
    
    socket.connect(PORT, 'localhost');
  });
}

// Condition 4: Proxy Configuration Issue
async function testCondition4() {
  console.log('\n📋 Condition 4: Proxy Configuration Issue');
  console.log('-'.repeat(60));
  
  // Check vite.config.ts proxy settings
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const viteConfigPath = path.join(__dirname, 'vite.config.ts');
    
    if (!fs.existsSync(viteConfigPath)) {
      console.log('⚠️  WARN: vite.config.ts not found');
      return null;
    }
    
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
    
    // Check for proxy configuration
    const hasProxy = viteConfig.includes('proxy:') || viteConfig.includes('"/api"');
    const hasTarget = viteConfig.includes('localhost:3000') || viteConfig.includes('target:');
    
    if (!hasProxy) {
      console.log('❌ FAIL: No proxy configuration found in vite.config.ts');
      console.log('   Solution: Add proxy configuration for /api');
      return false;
    }
    
    if (!hasTarget) {
      console.log('❌ FAIL: Proxy target not configured correctly');
      console.log('   Solution: Ensure target: "http://localhost:3000"');
      return false;
    }
    
    // Check if target matches our test port
    const targetMatch = viteConfig.match(/target:\s*["']([^"']+)["']/);
    if (targetMatch) {
      const target = targetMatch[1];
      if (target.includes('3000')) {
        console.log('✅ PASS: Proxy configuration looks correct');
        console.log(`   Target: ${target}`);
        return true;
      } else {
        console.log('❌ FAIL: Proxy target port mismatch');
        console.log(`   Found: ${target}, Expected: http://localhost:3000`);
        console.log('   Solution: Update proxy target to port 3000');
        return false;
      }
    }
    
    console.log('⚠️  WARN: Could not verify proxy target configuration');
    return null;
  } catch (err) {
    console.log(`⚠️  WARN: Could not check vite.config.ts: ${err.message}`);
    return null;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Starting Diagnostic Tests...\n');
  
  const results = {
    condition1: await testCondition1(),
    condition2: await testCondition2(),
    condition3: await testCondition3(),
    condition4: await testCondition4(),
  };
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const issues = [];
  if (results.condition1 === false) {
    issues.push('1. Test server is NOT running');
  }
  if (results.condition2 === false) {
    issues.push('2. Port 3000 is already in use');
  }
  if (results.condition3 === false) {
    issues.push('3. Network/firewall is blocking connection');
  }
  if (results.condition4 === false) {
    issues.push('4. Proxy configuration is incorrect');
  }
  
  if (issues.length === 0) {
    console.log('\n✅ All conditions passed! Proxy should work.');
    console.log('   If you still see errors, restart the dev server.');
  } else {
    console.log('\n❌ Issues Found:');
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    console.log('\n💡 Recommended Actions:');
    if (results.condition1 === false) {
      console.log('   → Start test server: node test-server.js');
    }
    if (results.condition2 === false) {
      console.log('   → Kill process on port 3000 or change port');
    }
    if (results.condition3 === false) {
      console.log('   → Check Windows Firewall settings');
    }
    if (results.condition4 === false) {
      console.log('   → Fix vite.config.ts proxy configuration');
    }
  }
  
  console.log('\n' + '='.repeat(60));
}

// Run tests
runAllTests().catch(console.error);

