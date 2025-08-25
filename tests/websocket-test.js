#!/usr/bin/env node

/**
 * Simple WebSocket Echo Test
 * Tests basic WebSocket communication
 */

const WebSocket = require('ws');

console.log('🔌 Testing WebSocket Echo Communication...\n');

function testWebSocketEcho() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://localhost:3001');
    let messageReceived = false;
    
    const timeout = setTimeout(() => {
      if (!messageReceived) {
        ws.close();
        reject(new Error('WebSocket echo test timeout - no response received'));
      }
    }, 5000);
    
    ws.on('open', () => {
      console.log('✅ WebSocket connection opened');
      
      // Send test message
      const testMessage = {
        type: 'ping',
        data: 'test-echo',
        timestamp: Date.now()
      };
      
      console.log('📤 Sending test message:', JSON.stringify(testMessage));
      ws.send(JSON.stringify(testMessage));
    });
    
    ws.on('message', (data) => {
      messageReceived = true;
      clearTimeout(timeout);
      
      try {
        const response = JSON.parse(data.toString());
        console.log('📥 Received response:', JSON.stringify(response));
        
        if (response.type === 'connected') {
          console.log('✅ WebSocket server responded with connection confirmation');
        } else {
          console.log('✅ WebSocket server responded with:', response.type);
        }
        
        ws.close();
        resolve(response);
      } catch (error) {
        console.log('📥 Received raw data:', data.toString());
        ws.close();
        resolve({ type: 'raw', data: data.toString() });
      }
    });
    
    ws.on('close', (code, reason) => {
      console.log(`🔌 WebSocket closed - Code: ${code}, Reason: ${reason || 'No reason'}`);
      if (!messageReceived) {
        reject(new Error(`WebSocket closed without response - Code: ${code}`));
      }
    });
    
    ws.on('error', (error) => {
      clearTimeout(timeout);
      console.error('❌ WebSocket error:', error.message);
      reject(error);
    });
  });
}

// Run test
testWebSocketEcho()
  .then((result) => {
    console.log('\n🎉 WebSocket echo test completed successfully!');
    console.log('Result:', result);
  })
  .catch((error) => {
    console.error('\n💥 WebSocket echo test failed:', error.message);
    process.exit(1);
  });