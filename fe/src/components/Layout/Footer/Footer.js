import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Thư viện Online</h3>
          <p>
            Nền tảng mượn sách trực tuyến hiện đại, 
            giúp bạn dễ dàng tiếp cận kho tàng tri thức đa dạng.
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Liên kết nhanh</h3>
          <ul>
            <li><Link to="/books">Danh mục sách</Link></li>
            <li><Link to="/categories">Thể loại</Link></li>
            <li><Link to="/authors">Tác giả</Link></li>
            <li><Link to="/news">Tin tức</Link></li>
            <li><Link to="/about">Về chúng tôi</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Hỗ trợ</h3>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/guide">Hướng dẫn mượn sách</Link></li>
            <li><Link to="/terms">Điều khoản sử dụng</Link></li>
            <li><Link to="/privacy">Chính sách bảo mật</Link></li>
            <li><Link to="/contact">Liên hệ</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Liên hệ</h3>
          <div className="contact-info">
            <p>
              <i className="fas fa-map-marker-alt"></i>
              123 Đường ABC, Quận XYZ, TP.HCM
            </p>
            <p>
              <i className="fas fa-phone"></i>
              (84) 123-456-789
            </p>
            <p>
              <i className="fas fa-envelope"></i>
              support@thuvien.com
            </p>
            <p>
              <i className="fas fa-clock"></i>
              Thứ 2 - Thứ 6: 8:00 - 17:00
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2024 Thư viện Online. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/terms">Điều khoản</Link>
            <Link to="/privacy">Bảo mật</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;