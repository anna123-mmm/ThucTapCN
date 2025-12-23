# 🎬 FlixGo - Ứng dụng xem phim trực tuyến

Ứng dụng web xem phim được xây dựng với Node.js, Express, MongoDB và tích hợp TMDB API & YouTube API.

## ✨ Tính năng

- 🎥 **Xem trailer phim** - Tự động tìm và phát trailer từ YouTube
- 🔍 **Tìm kiếm phim** - Tìm kiếm theo tên, thể loại, diễn viên
- 📱 **Responsive design** - Tương thích với mọi thiết bị
- 🎭 **Phân loại theo thể loại** - Action, Comedy, Drama, Horror, v.v.
- ⭐ **Đánh giá phim** - Hiển thị rating từ TMDB
- 👤 **Hệ thống đăng nhập** - Đăng ký/đăng nhập người dùng
- 🎨 **Giao diện đẹp** - Thiết kế hiện đại, dễ sử dụng

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js (v14 trở lên)
- MongoDB
- Git

### ⚡ Khởi động nhanh (Khuyến nghị)
```bash
# Clone repository
git clone <repository-url>
cd thuctap

# Kiểm tra kết nối và tạo dữ liệu mẫu tự động
npm run check

# Nếu mọi thứ OK, chạy ứng dụng
npm start
```

### 📋 Cài đặt thủ công

### 1. Clone repository
```bash
git clone <repository-url>
cd thuctap
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình môi trường
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin của bạn:
```env
# Database
MONGODB_URI=mongodb://127.0.0.1/node

# TMDB API (tùy chọn - để lấy thông tin phim)
TMDB_API_KEY=your_tmdb_api_key_here

# YouTube API (tùy chọn - để tìm trailer)
YOUTUBE_API_KEY=your_youtube_api_key_here

# Session Secret
SESSION_SECRET=your_session_secret_here

# Server Port (default: 5000)
PORT=5000
```

### 4. Khởi động MongoDB
Đảm bảo MongoDB đang chạy trên máy của bạn.

### 5. Tạo dữ liệu mẫu
```bash
npm run setup
```

### 6. Chạy ứng dụng
```bash
# Chế độ production
npm start

# Chế độ development (với nodemon)
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:5000

## 📊 Import dữ liệu phim

### Từ file CSV
Nếu bạn có file CSV chứa dữ liệu phim, đặt file vào thư mục `data/` với tên:
- `tmdb_movies_data.csv`
- `movies.csv`
- `tmdb_movies.csv`

Sau đó chạy:
```bash
npm run import
```

### Tạo dữ liệu mẫu
Nếu chưa có dữ liệu, chạy lệnh sau để tạo 12 bộ phim mẫu:
```bash
npm run sample
```

## 🔧 Cấu hình API Keys

### TMDB API Key (Tùy chọn)
1. Đăng ký tài khoản tại [TMDB](https://www.themoviedb.org/)
2. Vào [API Settings](https://www.themoviedb.org/settings/api)
3. Tạo API key và thêm vào file `.env`

### YouTube API Key (Tùy chọn)
1. Vào [Google Cloud Console](https://console.developers.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Bật YouTube Data API v3
4. Tạo API key và thêm vào file `.env`

**Lưu ý:** Ứng dụng vẫn hoạt động bình thường mà không cần API keys, chỉ là sẽ không tự động tìm trailer mới.

## 📁 Cấu trúc thư mục

```
├── models/          # MongoDB models
├── routes/          # Express routes
├── views/           # Handlebars templates
├── public/          # Static files (CSS, JS, images)
├── services/        # External API services
├── scripts/         # Utility scripts
├── data/           # CSV data files
└── bin/            # Server startup
```

## 🎯 Sử dụng

1. **Trang chủ**: Xem phim mới nhất và phổ biến
2. **Danh sách phim**: Duyệt tất cả phim với tìm kiếm và lọc
3. **Chi tiết phim**: Xem thông tin chi tiết và trailer
4. **Đăng ký/Đăng nhập**: Tạo tài khoản để sử dụng đầy đủ tính năng

## 🛠️ Công nghệ sử dụng

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Template Engine**: Handlebars
- **Authentication**: Passport.js
- **APIs**: TMDB API, YouTube Data API
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap

## 📝 Scripts có sẵn

- `npm start` - Chạy ứng dụng trên port 5000
- `npm run dev` - Chạy với nodemon (development)
- `npm run check` - Kiểm tra kết nối MongoDB và tạo dữ liệu mẫu
- `npm run import` - Import phim từ CSV
- `npm run sample` - Tạo dữ liệu mẫu
- `npm run setup` - Thiết lập ban đầu
- `npm run quick-start` - Khởi động nhanh với kiểm tra tự động

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License.

## 🆘 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra MongoDB đã chạy chưa
2. Kiểm tra file `.env` đã cấu hình đúng chưa
3. Chạy `npm run sample` để tạo dữ liệu mẫu
4. Kiểm tra console log để xem lỗi chi tiết

---

🎬 **Chúc bạn xem phim vui vẻ!** 🍿