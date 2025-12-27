/*
  Script: scripts/createSampleData.js
  Usage: node scripts/createSampleData.js
  Tạo dữ liệu mẫu cho ứng dụng nếu chưa có phim nào trong database
*/

require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');

const sampleMovies = [
  {
    title: "Avengers: Endgame",
    overview: "Sau những sự kiện tàn khốc của Infinity War, vũ trụ đang trong tình trạng hỗn loạn. Với sự giúp đỡ của các đồng minh còn lại, Avengers phải tập hợp một lần nữa để đảo ngược hành động của Thanos và khôi phục lại trật tự của vũ trụ.",
    releaseDate: "2019-04-26",
    year: 2019,
    genres: ["Action", "Adventure", "Drama"],
    rating: 8.4,
    tmdbId: "299534",
    posterPath: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    trailerId: "TcMBFSGVi1c"
  },
  {
    title: "Spider-Man: No Way Home",
    overview: "Lần đầu tiên trong lịch sử điện ảnh của Spider-Man, danh tính của Người Nhện thân thiện được tiết lộ, khiến trách nhiệm siêu anh hùng của anh xung đột với cuộc sống bình thường.",
    releaseDate: "2021-12-17",
    year: 2021,
    genres: ["Action", "Adventure", "Sci-Fi"],
    rating: 8.2,
    tmdbId: "634649",
    posterPath: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    trailerId: "JfVOs4VSpmA"
  },
  {
    title: "The Dark Knight",
    overview: "Batman phải chấp nhận một trong những thử thách tâm lý và thể chất lớn nhất để chống lại mối đe dọa từ tên tội phạm tàn bạo được biết đến với cái tên Joker.",
    releaseDate: "2008-07-18",
    year: 2008,
    genres: ["Action", "Crime", "Drama"],
    rating: 9.0,
    tmdbId: "155",
    posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    trailerId: "EXeTwQWrcwY"
  },
  {
    title: "Inception",
    overview: "Cobb, một tên trộm lành nghề chuyên đánh cắp bí mật từ tiềm thức trong lúc mọi người đang mơ, được giao một nhiệm vụ cuối cùng: thay vì đánh cắp ý tưởng, anh phải cấy một ý tưởng vào tâm trí.",
    releaseDate: "2010-07-16",
    year: 2010,
    genres: ["Action", "Sci-Fi", "Thriller"],
    rating: 8.8,
    tmdbId: "27205",
    posterPath: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    trailerId: "YoHD9XEInc0"
  },
  {
    title: "Parasite",
    overview: "Câu chuyện về gia đình Ki-taek, tất cả đều thất nghiệp và đặc biệt quan tâm đến cuộc sống của gia đình giàu có Park cho đến khi họ bị cuốn vào một sự cố bất ngờ.",
    releaseDate: "2019-05-30",
    year: 2019,
    genres: ["Comedy", "Drama", "Thriller"],
    rating: 8.6,
    tmdbId: "496243",
    posterPath: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    trailerId: "5xH0HfJHsaY"
  },
  {
    title: "Interstellar",
    overview: "Một nhóm nhà thám hiểm sử dụng một lỗ sâu mới được khám phá để vượt qua những giới hạn của du hành vũ trụ con người và chinh phục những khoảng cách rộng lớn trong một chuyến đi liên sao.",
    releaseDate: "2014-11-07",
    year: 2014,
    genres: ["Adventure", "Drama", "Sci-Fi"],
    rating: 8.6,
    tmdbId: "157336",
    posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    trailerId: "zSWdZVtXT7E"
  },
  {
    title: "The Shawshank Redemption",
    overview: "Hai người đàn ông bị giam giữ kết bạn qua nhiều năm, tìm thấy sự an ủi và cuối cùng là sự cứu chuộc thông qua những hành động tử tế và lòng tốt thông thường.",
    releaseDate: "1994-09-23",
    year: 1994,
    genres: ["Drama"],
    rating: 9.3,
    tmdbId: "278",
    posterPath: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    trailerId: "6hB3S9bIaco"
  },
  {
    title: "Pulp Fiction",
    overview: "Cuộc sống của hai sát thủ băng đảng, một võ sĩ quyền anh, vợ của một ông trùm tội phạm và một cặp cướp nhà hàng đan xen trong bốn câu chuyện về bạo lực và cứu chuộc.",
    releaseDate: "1994-10-14",
    year: 1994,
    genres: ["Crime", "Drama"],
    rating: 8.9,
    tmdbId: "680",
    posterPath: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    trailerId: "s7EdQ4FqbhY"
  },
  {
    title: "Forrest Gump",
    overview: "Câu chuyện về nhiều thập kỷ trong cuộc đời của Forrest Gump, một người đàn ông Alabama chậm hiểu nhưng tốt bụng, và những trải nghiệm phi thường của anh trong thế giới xung quanh.",
    releaseDate: "1994-07-06",
    year: 1994,
    genres: ["Drama", "Romance"],
    rating: 8.8,
    tmdbId: "13",
    posterPath: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    trailerId: "bLvqoHBptjg"
  },
  {
    title: "The Matrix",
    overview: "Một hacker máy tính học được từ những người nổi loạn bí ẩn về bản chất thực sự của thực tế của anh ta và vai trò của anh ta trong cuộc chiến chống lại những người kiểm soát nó.",
    releaseDate: "1999-03-31",
    year: 1999,
    genres: ["Action", "Sci-Fi"],
    rating: 8.7,
    tmdbId: "603",
    posterPath: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    trailerId: "vKQi3bBA1y8"
  },
  {
    title: "Goodfellas",
    overview: "Câu chuyện về Henry Hill và cuộc sống của anh ta trong băng đảng, bao gồm mối quan hệ của anh ta với vợ Karen Hill và các đối tác Jimmy Conway và Tommy DeVito.",
    releaseDate: "1990-09-21",
    year: 1990,
    genres: ["Biography", "Crime", "Drama"],
    rating: 8.7,
    tmdbId: "769",
    posterPath: "/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
    trailerId: "qo5jJpHtI1Y"
  },
  {
    title: "The Godfather",
    overview: "Câu chuyện về gia đình tội phạm Corleone dưới thời gia trưởng Vito Corleone, tập trung vào việc chuyển giao quyền lực từ cha sang con trai miễn cưỡng Michael.",
    releaseDate: "1972-03-24",
    year: 1972,
    genres: ["Crime", "Drama"],
    rating: 9.2,
    tmdbId: "238",
    posterPath: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    trailerId: "sY1S34973zA"
  },
  {
    title: "Top Gun: Maverick",
    overview: "Sau hơn ba mười năm phục vụ như một trong những phi công hàng đầu của Hải quân, Pete 'Maverick' Mitchell đang ở nơi anh thuộc về, thúc đẩy phong bì như một phi công thử nghiệm dũng cảm.",
    releaseDate: "2022-05-27",
    year: 2022,
    genres: ["Action", "Drama"],
    rating: 8.3,
    tmdbId: "361743",
    posterPath: "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    trailerId: "qSqVVswa420"
  },
  {
    title: "Avatar: The Way of Water",
    overview: "Jake Sully sống với gia đình mới được thành lập trên hành tinh Pandora. Khi một mối đe dọa quen thuộc trở lại để hoàn thành những gì đã bắt đầu trước đây, Jake phải làm việc với Neytiri và quân đội của chủng tộc Na'vi để bảo vệ hành tinh của họ.",
    releaseDate: "2022-12-16",
    year: 2022,
    genres: ["Action", "Adventure", "Sci-Fi"],
    rating: 7.6,
    tmdbId: "76600",
    posterPath: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    trailerId: "d9MyW72ELq0"
  },
  {
    title: "Black Panther: Wakanda Forever",
    overview: "Nữ hoàng Ramonda, Shuri, M'Baku, Okoye và Dora Milaje chiến đấu để bảo vệ quốc gia của họ khỏi các thế lực can thiệp sau cái chết của Vua T'Challa.",
    releaseDate: "2022-11-11",
    year: 2022,
    genres: ["Action", "Adventure", "Drama"],
    rating: 6.7,
    tmdbId: "505642",
    posterPath: "/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
    trailerId: "_Z3QKkl1WyM"
  },
  {
    title: "Dune",
    overview: "Paul Atreides, một chàng trai thông minh và tài năng sinh ra để làm những điều vĩ đại vượt quá sự hiểu biết của anh ta, phải đi đến hành tinh nguy hiểm nhất trong vũ trụ để đảm bảo tương lai của gia đình và người dân của anh ta.",
    releaseDate: "2021-10-22",
    year: 2021,
    genres: ["Action", "Adventure", "Drama"],
    rating: 8.0,
    tmdbId: "438631",
    posterPath: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    trailerId: "n9xhJrPXop4"
  }
];

async function createSampleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/flixgo');
    console.log('✅ Đã kết nối MongoDB');

    // Kiểm tra xem đã có phim nào chưa
    const existingCount = await Movie.countDocuments();
    
    if (existingCount > 0) {
      console.log(`📊 Database đã có ${existingCount} phim. Không cần tạo dữ liệu mẫu.`);
      process.exit(0);
    }

    console.log('📝 Đang tạo dữ liệu mẫu...');

    // Tạo dữ liệu mẫu
    const result = await Movie.insertMany(sampleMovies);
    
    console.log('\n═══════════════════════════════════════');
    console.log('✅ TẠO DỮ LIỆU MẪU THÀNH CÔNG!');
    console.log('═══════════════════════════════════════');
    console.log(`📥 Đã tạo: ${result.length} phim mẫu với poster và trailer`);
    console.log(`📊 Tổng số phim trong database: ${result.length}`);
    console.log('═══════════════════════════════════════');
    console.log('\n🎬 Danh sách phim đã tạo:');
    result.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.title} (${movie.year}) - ${movie.rating}/10 ${movie.trailerId ? '🎥' : ''}`);
    });
    console.log('\n🚀 Bây giờ bạn có thể chạy ứng dụng với: npm start');
    console.log('🌐 Truy cập: http://localhost:5000');

  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu mẫu:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createSampleData();