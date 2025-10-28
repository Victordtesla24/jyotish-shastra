/**
 * Global setup for Puppeteer UI tests
 * Ensures servers are running before tests begin
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let backendProcess;
let frontendProcess;

module.exports = async () => {
  console.log('🚀 Starting servers for UI tests...');
  
  // Check if servers are already running
  const backendHealth = await checkServerHealth('http://localhost:3001/api/v1/health');
  const frontendHealth = await checkServerHealth('http://localhost:3002');
  
  if (!backendHealth) {
    console.log('📡 Starting backend server...');
    backendProcess = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    
    // Wait for backend to be ready
    await waitForServer('http://localhost:3001/api/v1/health', 30000);
  }
  
  if (!frontendHealth) {
    console.log('🌐 Starting frontend server...');
    frontendProcess = spawn('npm', ['start'], {
      cwd: path.join(process.cwd(), 'client'),
      stdio: 'pipe'
    });
    
    // Wait for frontend to be ready
    await waitForServer('http://localhost:3002', 30000);
  }
  
  console.log('✅ Servers ready for UI tests');
};

async function checkServerHealth(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeout = 30000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch {
      // Server not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error(`Server at ${url} did not start within ${timeout}ms`);
}
