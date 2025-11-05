/**
 * Extended Proxy Error Diagnostic Tool
 * Tests the NEXT 4 most probable conditions (after initial 4)
 */

import http from 'http';
import net from 'net';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = 3000;

console.log('🔍 Testing NEXT 4 Most Probable Conditions\n');
console.log('='.repeat(60));

// Condition 5: Vite Proxy Syntax/Configuration Issue
async function testCondition5() {
  console.log('\n📋 Condition 5: Vite Proxy Syntax/Configuration');
  console.log('-'.repeat(60));
  
  try {
    const viteConfigPath = join(__dirname, 'vite.config.ts');
    if (!existsSync(viteConfigPath)) {
      console.log('❌ FAIL: vite.config.ts not found');
      return false;
    }
    
    const config = readFileSync(viteConfigPath, 'utf-8');
    
    // Check for proxy configuration
    const hasProxy = config.includes('proxy:') || config.includes('server:');
    if (!hasProxy) {
      console.log('❌ FAIL: No server.proxy configuration found');
      return false;
    }
    
    // Check proxy target
    const targetMatch = config.match(/target:\s*["']([^"']+)["']/);
    if (!targetMatch) {
      console.log('❌ FAIL: Proxy target not found or invalid syntax');
      return false;
    }
    
    const target = targetMatch[1];
    console.log(`✅ Target found: ${target}`);
    
    // Check if target is correct
    if (!target.includes('localhost') && !target.includes('127.0.0.1')) {
      console.log('⚠️  WARN: Target not using localhost/127.0.0.1');
    }
    
    if (!target.includes('3000')) {
      console.log('❌ FAIL: Target port is not 3000');
      return false;
    }
    
    // Check proxy path
    const pathMatch = config.match(/["'](\/api\/?)["']/);
    if (!pathMatch) {
      console.log('❌ FAIL: Proxy path "/api" not found');
      return false;
    }
    
    console.log(`✅ Proxy path found: ${pathMatch[1]}`);
    console.log('✅ PASS: Vite proxy configuration syntax is correct');
    return true;
  } catch (err) {
    console.log(`❌ FAIL: Error reading config: ${err.message}`);
    return false;
  }
}

// Condition 6: Server Listening on Wrong Interface
async function testCondition6() {
  console.log('\n📋 Condition 6: Server Listening Interface');
  console.log('-'.repeat(60));
  
  return new Promise((resolve) => {
    // Try connecting to different interfaces
    const interfaces = [
      { name: 'localhost', host: 'localhost' },
      { name: '127.0.0.1', host: '127.0.0.1' },
      { name: '0.0.0.0', host: 'localhost' }, // 0.0.0.0 should accept localhost
    ];
    
    let testsCompleted = 0;
    let anySuccess = false;
    
    interfaces.forEach((iface) => {
      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        testsCompleted++;
        if (testsCompleted === interfaces.length) {
          if (!anySuccess) {
            console.log('❌ FAIL: Cannot connect on any interface');
            console.log('   Server might not be listening or wrong interface');
            resolve(false);
          }
        }
      }, 1000);
      
      socket.on('connect', () => {
        clearTimeout(timeout);
        socket.destroy();
        if (!anySuccess) {
          console.log(`✅ PASS: Server is listening on ${iface.name}`);
          anySuccess = true;
          resolve(true);
        }
        testsCompleted++;
      });
      
      socket.on('error', () => {
        clearTimeout(timeout);
        testsCompleted++;
        if (testsCompleted === interfaces.length && !anySuccess) {
          console.log('❌ FAIL: Server not listening on any tested interface');
          resolve(false);
        }
      });
      
      socket.connect(PORT, iface.host);
    });
  });
}

// Condition 7: CORS Configuration Issue
async function testCondition7() {
  console.log('\n📋 Condition 7: CORS Configuration');
  console.log('-'.repeat(60));
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: '/health',
      method: 'OPTIONS', // Preflight request
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, X-API-Key'
      }
    }, (res) => {
      const corsHeaders = {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers'],
      };
      
      if (corsHeaders['access-control-allow-origin']) {
        console.log('✅ PASS: CORS headers present');
        console.log(`   Origin: ${corsHeaders['access-control-allow-origin']}`);
        console.log(`   Methods: ${corsHeaders['access-control-allow-methods'] || 'Not specified'}`);
        resolve(true);
      } else {
        console.log('⚠️  WARN: CORS headers not found in OPTIONS response');
        console.log('   This might cause issues if server is running');
        resolve(null);
      }
    });
    
    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.log('⚠️  SKIP: Server not running (can\'t test CORS)');
        resolve(null);
      } else {
        console.log(`❌ FAIL: CORS test error: ${err.message}`);
        resolve(false);
      }
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      console.log('❌ FAIL: CORS test timeout');
      resolve(false);
    });
    
    req.end();
  });
}

// Condition 8: Request Path Mismatch
async function testCondition8() {
  console.log('\n📋 Condition 8: Request Path Mismatch');
  console.log('-'.repeat(60));
  
  // Test different path variations
  const paths = [
    '/api/chat',
    '/api/visits',
    '/api/health',
    '/health',
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const path of paths) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${PORT}${path}`, { timeout: 2000 }, (res) => {
          if (res.statusCode === 404) {
            console.log(`⚠️  WARN: ${path} returns 404 (not found)`);
            failed++;
          } else {
            console.log(`✅ ${path} → ${res.statusCode}`);
            passed++;
          }
          resolve();
        });
        
        req.on('error', (err) => {
          if (err.code === 'ECONNREFUSED') {
            console.log(`⚠️  SKIP: ${path} (server not running)`);
            resolve(); // Skip, not a path issue
          } else {
            console.log(`❌ ${path} → Error: ${err.message}`);
            failed++;
            resolve();
          }
        });
        
        req.on('timeout', () => {
          req.destroy();
          console.log(`❌ ${path} → Timeout`);
          failed++;
          resolve();
        });
      });
    } catch (err) {
      failed++;
    }
  }
  
  if (passed > 0) {
    console.log(`✅ PASS: At least ${passed} path(s) are working`);
    return true;
  } else if (failed === 0) {
    console.log('⚠️  SKIP: Server not running (can\'t test paths)');
    return null;
  } else {
    console.log('❌ FAIL: All tested paths failed');
    return false;
  }
}

// Condition 9: Windows Firewall Blocking Node.js
async function testCondition9() {
  console.log('\n📋 Condition 9: Windows Firewall Blocking');
  console.log('-'.repeat(60));
  
  // This is harder to test programmatically, but we can check:
  // 1. If server starts but can't connect
  // 2. If connection works from localhost but not from network
  
  return new Promise((resolve) => {
    // Try to connect from localhost
    const localhostSocket = new net.Socket();
    let localhostWorks = false;
    
    localhostSocket.on('connect', () => {
      localhostWorks = true;
      localhostSocket.destroy();
      console.log('✅ PASS: Localhost connection works');
      console.log('   Firewall is not blocking localhost connections');
      resolve(true);
    });
    
    localhostSocket.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.log('⚠️  SKIP: Server not running (can\'t test firewall)');
        resolve(null);
      } else {
        console.log(`❌ FAIL: Localhost connection error: ${err.code}`);
        console.log('   Possible firewall blocking');
        resolve(false);
      }
    });
    
    localhostSocket.setTimeout(2000, () => {
      localhostSocket.destroy();
      console.log('❌ FAIL: Localhost connection timeout');
      console.log('   Possible firewall blocking');
      resolve(false);
    });
    
    localhostSocket.connect(PORT, 'localhost');
  });
}

// Condition 10: Multiple Server Instances / Port Already Bound
async function testCondition10() {
  console.log('\n📋 Condition 10: Multiple Instances / Port Binding');
  console.log('-'.repeat(60));
  
  return new Promise((resolve) => {
    // Try to create a test server on the same port
    const testServer = net.createServer();
    
    testServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log('✅ PASS: Port 3000 is in use (server is running)');
        resolve(true);
      } else {
        console.log(`❌ FAIL: Unexpected error: ${err.message}`);
        resolve(false);
      }
    });
    
    testServer.on('listening', () => {
      console.log('⚠️  WARN: Port 3000 is available (server might not be running)');
      testServer.close(() => resolve(null));
    });
    
    testServer.listen(PORT, 'localhost');
  });
}

// Run all extended tests
async function runExtendedTests() {
  console.log('\n🚀 Starting Extended Diagnostic Tests...\n');
  
  const results = {
    condition5: await testCondition5(),
    condition6: await testCondition6(),
    condition7: await testCondition7(),
    condition8: await testCondition8(),
    condition9: await testCondition9(),
    condition10: await testCondition10(),
  };
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 EXTENDED TEST SUMMARY');
  console.log('='.repeat(60));
  
  const issues = [];
  const warnings = [];
  
  if (results.condition5 === false) issues.push('5. Vite proxy configuration syntax issue');
  if (results.condition6 === false) issues.push('6. Server listening on wrong interface');
  if (results.condition7 === false) issues.push('7. CORS configuration problem');
  if (results.condition8 === false) issues.push('8. Request path mismatch');
  if (results.condition9 === false) issues.push('9. Windows Firewall blocking');
  if (results.condition10 === false) issues.push('10. Port binding issue');
  
  if (results.condition5 === null) warnings.push('5. Could not verify proxy config');
  if (results.condition6 === null) warnings.push('6. Could not test interface');
  if (results.condition7 === null) warnings.push('7. Could not test CORS (server not running)');
  if (results.condition8 === null) warnings.push('8. Could not test paths (server not running)');
  if (results.condition9 === null) warnings.push('9. Could not test firewall (server not running)');
  if (results.condition10 === null) warnings.push('10. Could not verify port binding');
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log('\n✅ All extended conditions passed!');
  } else {
    if (issues.length > 0) {
      console.log('\n❌ Issues Found:');
      issues.forEach((issue) => console.log(`   ${issue}`));
    }
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings (tests skipped):');
      warnings.forEach((warning) => console.log(`   ${warning}`));
    }
  }
  
  console.log('\n' + '='.repeat(60));
}

runExtendedTests().catch(console.error);

