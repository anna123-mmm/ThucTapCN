#!/usr/bin/env node

/**
 * Script kiểm tra kết nối MongoDB và tạo dữ liệu mẫu nếu cần
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');

async function checkConnection() {
  try {
    console.log('🔍 Đang kiểm tra kết nối MongoDB...');
    
    // Kết nối MongoDB với timeout
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/node', {
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    
    console.log('✅ Kết nối MongoDB thành công!');
    
    // Kiểm tra số lượng phim
    const movieCount = await Movie.countDocuments();
    console.log(`📊 Database hiện có: ${movieCount} bộ phim`);
    
    if (movieCount === 0) {
      console.log('\n📝 Database trống, đang tạo dữ liệu mẫu...');
      
      // Import sample data
      const { spawn } = require('child_process');
      const sampleProcess = spawn('node', ['scripts/createSampleData.js'], { stdio: 'inherit' });
      
      sampleProcess.on('close', (code) => {
        if (code === 0) {
          console.log('\n🎉 Sẵn sàng! Chạy lệnh sau để khởi động:');
          console.log('   npm start');
          console.log('\n🌐 Ứng dụng sẽ chạy tại: http://localhost:5000');
        }
        process.exit(code);
      });
    } else {
      console.log('\n🎉 Mọi thứ đã sẵn sàng!');
      console.log('🚀 Chạy lệnh sau để khởi động:');
      console.log('   npm start');
      console.log('\n🌐 Ứng dụng sẽ chạy tại: http://localhost:5000');
      process.exit(0);
    }
    
  } catch (error) {
    console.log('\n❌ Lỗi kết nối MongoDB:');
    console.log('   ', error.message);
    console.log('\n🔧 Hướng dẫn khắc phục:');
    console.log('   1. Đảm bảo MongoDB đang chạy');
    console.log('   2. Kiểm tra MONGODB_URI trong file .env');
    console.log('   3. Cài đặt MongoDB: https://docs.mongodb.com/manual/installation/');
    console.log('\n💡 Hoặc sử dụng MongoDB Atlas (cloud):');
    console.log('   https://www.mongodb.com/atlas');
    process.exit(1);
  }
}

checkConnection();