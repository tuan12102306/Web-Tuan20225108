import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../../components/Books/BookCard/BookCard';
import Loading from '../../components/Common/Loading/Loading';
import './HomePage.css';

const HomePage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/home');
      
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu trang chủ');
      }

      const data = await response.json();
      setFeaturedBooks(data.featuredBooks);
      setNewBooks(data.newBooks);
      setPopularBooks(data.popularBooks);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Chào mừng đến với Thư viện</h1>
          <p>Khám phá kho tàng tri thức với hàng nghìn đầu sách đa dạng</p>
          <Link to="/books" className="browse-button">
            <i className="fas fa-book-open"></i>
            Xem tất cả sách
          </Link>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="book-section">
        <div className="section-header">
          <h2>Sách nổi bật</h2>
          <Link to="/books?category=featured" className="view-all">
            Xem tất cả <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        <div className="books-grid">
          {featuredBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* New Books Section */}
      <section className="book-section">
        <div className="section-header">
          <h2>Sách mới</h2>
          <Link to="/books?category=new" className="view-all">
            Xem tất cả <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        <div className="books-grid">
          {newBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Popular Books Section */}
      <section className="book-section">
        <div className="section-header">
          <h2>Sách được yêu thích</h2>
          <Link to="/books?category=popular" className="view-all">
            Xem tất cả <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        <div className="books-grid">
          {popularBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2>Danh mục sách</h2>
        <div className="categories-grid">
          <Link to="/books?category=fiction" className="category-card">
            <i className="fas fa-book"></i>
            <h3>Văn học</h3>
            <p>Tiểu thuyết, truyện ngắn, thơ ca...</p>
          </Link>
          <Link to="/books?category=education" className="category-card">
            <i className="fas fa-graduation-cap"></i>
            <h3>Giáo dục</h3>
            <p>Sách giáo khoa, tham khảo...</p>
          </Link>
          <Link to="/books?category=science" className="category-card">
            <i className="fas fa-flask"></i>
            <h3>Khoa học</h3>
            <p>Khoa học tự nhiên, công nghệ...</p>
          </Link>
          <Link to="/books?category=business" className="category-card">
            <i className="fas fa-chart-line"></i>
            <h3>Kinh doanh</h3>
            <p>Quản trị, marketing, tài chính...</p>
          </Link>
        </div>
      </section>

      {/* Library Info Section */}
      <section className="library-info">
        <div className="info-grid">
          <div className="info-card">
            <i className="fas fa-clock"></i>
            <h3>Giờ mở cửa</h3>
            <p>Thứ 2 - Thứ 6: 8:00 - 21:00</p>
            <p>Thứ 7 - Chủ nhật: 9:00 - 17:00</p>
          </div>
          <div className="info-card">
            <i className="fas fa-map-marker-alt"></i>
            <h3>Địa chỉ</h3>
            <p>123 Đường ABC, Quận XYZ</p>
            <p>TP. Hồ Chí Minh</p>
          </div>
          <div className="info-card">
            <i className="fas fa-phone"></i>
            <h3>Liên hệ</h3>
            <p>Điện thoại: (028) 1234 5678</p>
            <p>Email: contact@thuvien.edu.vn</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
