/**
 * WebSocket Mock for Puppeteer Tests
 * Resolves WebSocket conflicts in Node.js environment
 */

class MockWebSocket {
  constructor(url, protocols) {
    this.url = url;
    this.protocols = protocols;
    this.readyState = 1; // OPEN
    this.CONNECTING = 0;
    this.OPEN = 1;
    this.CLOSING = 2;
    this.CLOSED = 3;
    
    // Mock event handlers
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
    
    // Simulate immediate connection
    setTimeout(() => {
      if (this.onopen) {
        this.onopen({ type: 'open' });
      }
    }, 0);
  }
  
  send(data) {
    // Mock send functionality
    return true;
  }
  
  close(code, reason) {
    this.readyState = this.CLOSED;
    if (this.onclose) {
      this.onclose({ code, reason, type: 'close' });
    }
  }
  
  addEventListener(type, listener) {
    this[`on${type}`] = listener;
  }
  
  removeEventListener(type, listener) {
    this[`on${type}`] = null;
  }
}

// Export both default and named exports
module.exports = MockWebSocket;
module.exports.default = MockWebSocket;
module.exports.WebSocket = MockWebSocket;
