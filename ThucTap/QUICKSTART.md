# 🚀 Hướng dẫn khởi động nhanh FlixGo

## 📋 Checklist trước khi bắt đầu

- [ ] Node.js đã cài đặt (v14+)
- [ ] MongoDB đang chạy
- [ ] Git đã cài đặt

## ⚡ Khởi động trong 3 bước

### 1. Clone và cài đặt
```bash
git clone <repository-url>
cd thuctap
npm install
```

### 2. Kiểm tra hệ thống
```bash
npm run check
```

### 3. Chạy ứng dụng
```bash
npm start
```

🎉 **Xong!** Mở trình duyệt và truy cập: http://localhost:5000

## 🔧 Nếu gặp lỗi

### MongoDB không kết nối được
```bash
# Kiểm tra MongoDB có đang chạy không
mongosh

# Nếu chưa cài MongoDB:
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb
```

### Port 5000 đã được sử dụng
```bash
# Thay đổi port trong file .env
echo "PORT=3001" >> .env
npm start
```

### Không có dữ liệu phim
```bash
# Tạo dữ liệu mẫu
npm run sample
```

## 🎬 Tính năng chính

- **Trang chủ**: Phim mới nhất và phổ biến
- **Danh sách phim**: Tìm kiếm và lọc theo thể loại
- **Chi tiết phim**: Thông tin và trailer
- **Xem trailer**: Player video tích hợp YouTube

## 🔑 API Keys (Tùy chọn)

Để có trải nghiệm tốt nhất, bạn có thể thêm API keys:

### TMDB API
1. Đăng ký tại: https://www.themoviedb.org/
2. Lấy API key tại: https://www.themoviedb.org/settings/api
3. Thêm vào file `.env`: `TMDB_API_KEY=your_key_here`

### YouTube API
1. Tạo project tại: https://console.developers.google.com/
2. Bật YouTube Data API v3
3. Tạo API key và thêm vào `.env`: `YOUTUBE_API_KEY=your_key_here`

## 📱 Sử dụng

1. **Trang chủ** - Xem phim nổi bật
2. **Catalog** - Duyệt tất cả phim
3. **Tìm kiếm** - Nhấn icon tìm kiếm ở header
4. **Xem trailer** - Nhấn nút play trên bất kỳ phim nào

## 🆘 Cần hỗ trợ?

- Kiểm tra file `README.md` để biết thêm chi tiết
- Đảm bảo MongoDB đang chạy
- Chạy `npm run check` để kiểm tra hệ thống
- Kiểm tra console log để xem lỗi chi tiết

---

🎬 **Chúc bạn xem phim vui vẻ!** 🍿