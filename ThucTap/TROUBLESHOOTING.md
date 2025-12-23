# 🔧 Khắc phục sự cố FlixGo

## 🎬 Vấn đề về Trailer và Poster

### ❌ Không xem được trailer
**Triệu chứng:** Nhấn "Xem Trailer" nhưng không có video hiển thị

**Giải pháp:**
```bash
# 1. Reset dữ liệu với trailer mới
npm run reset

# 2. Hoặc kiểm tra kết nối internet
# 3. Thử refresh trang (F5)
```

### 🖼️ Poster phim giống nhau
**Triệu chứng:** Tất cả phim đều có poster giống nhau

**Giải pháp:**
```bash
# Reset dữ liệu với poster khác nhau
npm run reset
```

### 🎥 Lỗi giao diện trang xem phim
**Triệu chứng:** Giao diện bị vỡ, không hiển thị đúng

**Giải pháp:**
```bash
# 1. Xóa cache trình duyệt (Ctrl+Shift+Delete)
# 2. Hard refresh (Ctrl+F5)
# 3. Kiểm tra console log (F12)
```

## 🔌 Vấn đề kết nối

### ❌ MongoDB không kết nối được
**Lỗi:** `Error connecting to MongoDB`

**Giải pháp:**
```bash
# Kiểm tra MongoDB có chạy không
mongosh

# Nếu chưa cài MongoDB:
# Windows: Tải từ https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb
```

### 🔌 Port 5000 đã được sử dụng
**Lỗi:** `Port 5000 is already in use`

**Giải pháp:**
```bash
# Thay đổi port trong file .env
echo "PORT=3001" >> .env
npm start
```

## 📊 Vấn đề dữ liệu

### 📭 Không có phim nào hiển thị
**Triệu chứng:** Trang chủ và danh sách phim trống

**Giải pháp:**
```bash
# Tạo dữ liệu mẫu
npm run sample

# Hoặc reset toàn bộ
npm run reset
```

### 🔍 Tìm kiếm không hoạt động
**Triệu chứng:** Nhập từ khóa nhưng không có kết quả

**Giải pháp:**
```bash
# 1. Kiểm tra có dữ liệu không
npm run check

# 2. Thử tìm kiếm từ khóa khác
# 3. Xóa từ khóa và xem tất cả phim
```

## 🎨 Vấn đề giao diện

### 🎨 CSS không load
**Triệu chứng:** Giao diện không có style, trông xấu

**Giải pháp:**
```bash
# 1. Hard refresh (Ctrl+F5)
# 2. Xóa cache trình duyệt
# 3. Kiểm tra file CSS có tồn tại không
ls public/css/
```

### 📱 Không responsive trên mobile
**Triệu chứng:** Giao diện vỡ trên điện thoại

**Giải pháp:**
- Refresh trang
- Kiểm tra viewport meta tag
- Thử trình duyệt khác

## 🚀 Vấn đề khởi động

### ❌ npm start không hoạt động
**Lỗi:** Command not found hoặc lỗi khác

**Giải pháp:**
```bash
# 1. Cài đặt lại dependencies
rm -rf node_modules package-lock.json
npm install

# 2. Kiểm tra Node.js version
node --version  # Cần >= v14

# 3. Chạy trực tiếp
node bin/www
```

### 🔄 Nodemon không tự restart
**Triệu chứng:** Thay đổi code nhưng server không restart

**Giải pháp:**
```bash
# Cài đặt lại nodemon
npm install -g nodemon
npm run dev
```

## 🔍 Debug và kiểm tra

### 📋 Kiểm tra hệ thống
```bash
# Kiểm tra toàn bộ hệ thống
npm run check

# Kiểm tra MongoDB
mongosh

# Kiểm tra port
netstat -an | grep 5000
```

### 🔍 Xem log chi tiết
```bash
# Chạy với debug mode
DEBUG=* npm start

# Hoặc xem log trong browser
# Nhấn F12 -> Console tab
```

### 📊 Kiểm tra dữ liệu
```bash
# Kết nối MongoDB và kiểm tra
mongosh
use node
db.movies.count()
db.movies.find().limit(5)
```

## 🆘 Các lệnh hữu ích

```bash
# Reset toàn bộ (khuyến nghị khi có lỗi)
npm run reset

# Kiểm tra hệ thống
npm run check

# Khởi động nhanh
npm run quick-start

# Tạo dữ liệu mẫu mới
npm run sample

# Import từ CSV (nếu có)
npm run import
```

## 📞 Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề:

1. **Kiểm tra lại README.md** - Có thể bạn bỏ qua bước nào đó
2. **Chạy `npm run reset`** - Giải quyết 90% vấn đề
3. **Kiểm tra console log** - F12 trong trình duyệt
4. **Thử trình duyệt khác** - Chrome, Firefox, Edge
5. **Restart máy tính** - Đôi khi cần thiết

---

🎬 **Chúc bạn sử dụng FlixGo vui vẻ!** 🍿