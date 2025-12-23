#!/usr/bin/env node

/**
 * Script: scripts/resetData.js
 * Usage: node scripts/resetData.js
 * Xóa tất cả dữ liệu phim cũ và tạo lại dữ liệu mẫu mới
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');

async function resetData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/node');
    console.log('✅ Đã kết nối MongoDB');

    // Xóa tất cả dữ liệu phim cũ
    const deleteResult = await Movie.deleteMany({});
    console.log(`🗑️  Đã xóa ${deleteResult.deletedCount} phim cũ`);

    console.log('🔄 Đang tạo dữ liệu mẫu mới...');

    // Chạy script tạo dữ liệu mẫu
    const { spawn } = require('child_process');
    const sampleProcess = spawn('node', ['scripts/createSampleData.js'], { stdio: 'inherit' });
    
    sampleProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n🎉 Reset dữ liệu thành công!');
        console.log('🚀 Chạy lệnh sau để khởi động:');
        console.log('   npm start');
        console.log('\n🌐 Ứng dụng sẽ chạy tại: http://localhost:5000');
      }
      process.exit(code);
    });

  } catch (error) {
    console.error('❌ Lỗi khi reset dữ liệu:', error);
    process.exit(1);
  }
}

resetData();