#!/usr/bin/env node

/**
 * Quick start script for FlixGo Movie App
 * Checks dependencies and starts the application
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎬 Starting FlixGo Movie App...\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('⚠️  File .env không tồn tại!');
  console.log('📝 Tạo file .env từ .env.example:');
  console.log('   cp .env.example .env\n');
  
  // Try to copy .env.example to .env
  try {
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ Đã tạo file .env từ .env.example');
  } catch (err) {
    console.log('❌ Không thể tạo file .env tự động');
    console.log('   Vui lòng tạo thủ công: cp .env.example .env');
    process.exit(1);
  }
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Đang cài đặt dependencies...');
  const install = spawn('npm', ['install'], { stdio: 'inherit' });
  
  install.on('close', (code) => {
    if (code !== 0) {
      console.log('❌ Lỗi khi cài đặt dependencies');
      process.exit(1);
    }
    startApp();
  });
} else {
  startApp();
}

function startApp() {
  console.log('🚀 Đang khởi động server...\n');
  
  // Start the application
  const app = spawn('npm', ['start'], { stdio: 'inherit' });
  
  app.on('close', (code) => {
    console.log(`\n👋 Server đã dừng với code ${code}`);
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Đang dừng server...');
    app.kill('SIGINT');
  });
}