#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting IT Support Assistant...\n');

// Start json-server
console.log('📊 Starting JSON Server on port 5000...');
const server = spawn('npx', ['json-server', '--watch', 'db.json', '--port', '5000'], {
  stdio: 'inherit',
  shell: true
});

// Start Vite dev server
console.log('⚡ Starting Vite dev server on port 5173...');
const client = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  server.kill();
  client.kill();
  process.exit();
});

server.on('error', (err) => {
  console.error('❌ JSON Server error:', err);
});

client.on('error', (err) => {
  console.error('❌ Vite server error:', err);
});

console.log('\n✅ Both servers starting...');
console.log('📖 JSON Server: http://localhost:5000');
console.log('🌐 React App: http://localhost:5173');
console.log('\nPress Ctrl+C to stop both servers');